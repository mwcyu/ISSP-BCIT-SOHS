import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { marked } from 'marked';
import TurndownService from 'turndown';
import type { SessionSummary } from '../../types/summary';

const turndownService = new TurndownService();

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 11,
        lineHeight: 1.5,
        color: '#333333',
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eeeeee',
        paddingBottom: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#003366', // BCIT Blue
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 10,
        color: '#666666',
    },
    section: {
        marginBottom: 15,
    },
    h1: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 12,
        marginBottom: 6,
        color: '#003366',
    },
    h2: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
        color: '#444444',
    },
    h3: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 4,
        color: '#555555',
    },
    text: {
        marginBottom: 4,
        textAlign: 'justify',
    },
    listItem: {
        flexDirection: 'row',
        marginBottom: 2,
    },
    bullet: {
        width: 15,
        fontSize: 14,
        lineHeight: 1,
    },
    listItemContent: {
        flex: 1,
    },
});

// Helper for inline text (bold, italic, etc.)
const InlineText = ({ tokens }: { tokens?: any[] }) => {
    if (!tokens) return null;

    return (
        <Text>
            {tokens.map((t, i) => {
                if (t.type === 'strong') {
                    return <Text key={i} style={{ fontWeight: 'bold' }}>{t.text}</Text>;
                }
                if (t.type === 'em') {
                    return <Text key={i} style={{ fontStyle: 'italic' }}>{t.text}</Text>;
                }
                if (t.type === 'codespan') {
                    return <Text key={i} style={{ fontFamily: 'Courier', backgroundColor: '#f0f0f0' }}>{t.text}</Text>;
                }
                // Handle nested tokens if any (marked can nest)
                if (t.tokens) {
                    return <InlineText key={i} tokens={t.tokens} />;
                }
                return <Text key={i}>{t.text}</Text>;
            })}
        </Text>
    );
};

// Helper to render markdown tokens
const MarkdownRenderer = ({ content }: { content: string }) => {
    if (!content) return null;

    // Convert HTML to Markdown first
    const markdown = turndownService.turndown(content);
    const tokens = marked.lexer(markdown);

    return (
        <View>
            {tokens.map((token: any, index: number) => {
                switch (token.type) {
                    case 'heading':
                        const HeadingStyle = [styles.h1, styles.h2, styles.h3][token.depth - 1] || styles.h3;
                        // Headings usually contain inline tokens
                        return (
                            <Text key={index} style={HeadingStyle}>
                                <InlineText tokens={token.tokens} />
                            </Text>
                        );

                    case 'paragraph':
                        return (
                            <View key={index} style={styles.text}>
                                <InlineText tokens={token.tokens} />
                            </View>
                        );

                    case 'list':
                        return (
                            <View key={index} style={styles.section}>
                                {token.items.map((item: any, i: number) => (
                                    <View key={i} style={styles.listItem}>
                                        <Text style={styles.bullet}>•</Text>
                                        <View style={styles.listItemContent}>
                                            {/* List items have a 'text' token or tokens array */}
                                            <InlineText tokens={item.tokens} />
                                        </View>
                                    </View>
                                ))}
                            </View>
                        );

                    case 'space':
                        return <View key={index} style={{ height: 5 }} />;

                    default:
                        // Fallback for unhandled types
                        if (token.text) {
                            return <Text key={index} style={styles.text}>{token.text}</Text>;
                        }
                        return null;
                }
            })}
        </View>
    );
};

export const SessionPdfDocument = ({ summary }: { summary: SessionSummary }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>Feedback Summary Report</Text>
                <Text style={styles.subtitle}>
                    Generated: {summary.created_at ? new Date(summary.created_at).toLocaleString() : new Date().toLocaleString()}
                </Text>
                <Text style={styles.subtitle}>Session ID: {summary.sessionId}</Text>
            </View>

            <View>
                {[summary.s1_summary, summary.s2_summary, summary.s3_summary, summary.s4_summary]
                    .filter(Boolean)
                    .map((block, i) => (
                        <View key={i} style={styles.section}>
                            <MarkdownRenderer content={block || ''} />
                        </View>
                    ))}
            </View>
        </Page>
    </Document>
);
