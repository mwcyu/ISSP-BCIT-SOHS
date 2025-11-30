import { Standard } from "../../../types";

interface StandardCardProps {
    standard: Standard;
    onClick: () => void;
}

export const StandardCard = ({ standard, onClick }: StandardCardProps) => (
    <button
        onClick={onClick}
        className="group flex flex-col items-start text-left p-5 bg-white border border-gray-200 rounded-xl 
               card-hover hover:border-bcit-blue hover:scale-[1.02] transition-all duration-200 shadow-sm hover:shadow-md"
    >
        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-bcit-blue transition-colors">
            {standard.title}
        </h3>
        <p className="text-sm text-gray-500 leading-snug group-hover:text-gray-600 transition-colors">
            {standard.subtitle}
        </p>
    </button>
);
