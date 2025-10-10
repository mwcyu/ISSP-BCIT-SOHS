"""
Utility functions for exporting feedback reports
"""
import json
import csv
from pathlib import Path
from typing import Dict, Any
from datetime import datetime
from .models import FinalReport, FeedbackSession
from .config import Config


class ReportExporter:
    """Handles exporting feedback reports to various formats"""
    
    def __init__(self, output_dir: str = None):
        self.output_dir = Path(output_dir or Config.OUTPUT_DIR)
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def export_report(self, report: FinalReport, formats: list = None) -> Dict[str, str]:
        """Export report to specified formats
        
        Args:
            report: FinalReport object to export
            formats: List of formats ('json', 'csv'). Defaults to Config.EXPORT_FORMAT
            
        Returns:
            Dict mapping format to file path
        """
        formats = formats or Config.EXPORT_FORMAT
        exported_files = {}
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        base_filename = f"feedback_{report.session_id[:8]}_{timestamp}"
        
        if 'json' in formats:
            json_path = self._export_json(report, base_filename)
            exported_files['json'] = str(json_path)
        
        if 'csv' in formats:
            csv_path = self._export_csv(report, base_filename)
            exported_files['csv'] = str(csv_path)
        
        return exported_files
    
    def _export_json(self, report: FinalReport, base_filename: str) -> Path:
        """Export report as JSON"""
        filepath = self.output_dir / f"{base_filename}.json"
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(report.to_dict(), f, indent=2, ensure_ascii=False)
        
        return filepath
    
    def _export_csv(self, report: FinalReport, base_filename: str) -> Path:
        """Export report as CSV"""
        filepath = self.output_dir / f"{base_filename}.csv"
        
        with open(filepath, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            
            # Header
            writer.writerow([
                'Session ID',
                'Generated At',
                'Standard',
                'Summary',
                'Suggestion',
                'Raw Feedback'
            ])
            
            # Data rows
            for standard_name, feedback_data in report.standards_feedback.items():
                writer.writerow([
                    report.session_id,
                    report.generated_at.isoformat(),
                    standard_name,
                    feedback_data['summary'],
                    feedback_data['suggestion'],
                    feedback_data['raw_feedback']
                ])
        
        return filepath
    
    def export_session(self, session: FeedbackSession) -> Dict[str, str]:
        """Export complete session data including conversation history"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"session_{session.session_id[:8]}_{timestamp}.json"
        filepath = self.output_dir / filename
        
        session_data = {
            "session_id": session.session_id,
            "state": session.state.value,
            "started_at": session.started_at.isoformat(),
            "completed_at": session.completed_at.isoformat() if session.completed_at else None,
            "preceptor_email": session.preceptor_email,
            "conversation_history": [
                {
                    "speaker": turn.speaker,
                    "message": turn.message,
                    "timestamp": turn.timestamp.isoformat()
                }
                for turn in session.conversation_history
            ],
            "feedback_collected": {
                standard.value: {
                    "raw_feedback": feedback.raw_feedback,
                    "summary": feedback.summary,
                    "suggestion": feedback.suggestion,
                    "confirmed": feedback.confirmed,
                    "quality_evaluation": {
                        "is_specific": feedback.quality_evaluation.is_specific,
                        "has_example": feedback.quality_evaluation.has_example,
                        "quality": feedback.quality_evaluation.quality.value
                    } if feedback.quality_evaluation else None
                }
                for standard, feedback in session.feedback_collected.items()
            }
        }
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(session_data, f, indent=2, ensure_ascii=False)
        
        return {"session": str(filepath)}


def format_report_for_display(report: FinalReport) -> str:
    """Format report as readable text for display"""
    
    lines = [
        "=" * 80,
        "CLINICAL FEEDBACK REPORT",
        "=" * 80,
        f"Session ID: {report.session_id}",
        f"Generated: {report.generated_at.strftime('%Y-%m-%d %H:%M:%S')}",
        "=" * 80,
        ""
    ]
    
    for standard_name, feedback in report.standards_feedback.items():
        lines.extend([
            f"\n{standard_name}",
            "-" * 80,
            "",
            "SUMMARY:",
            feedback['summary'],
            "",
            "SUGGESTED ACTION:",
            feedback['suggestion'],
            "",
            "=" * 80
        ])
    
    return "\n".join(lines)
