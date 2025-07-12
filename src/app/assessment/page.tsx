import { ConditionAssessment } from "@/components/condition-assessment";

export default function AssessmentPage() {
    return (
        <div className="p-4 md:p-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground mb-1">
                AI Condition Assessment
            </h1>
            <p className="text-muted-foreground mb-8">
                Upload a photo of your vehicle for an AI-driven analysis of its condition.
            </p>
            <ConditionAssessment />
        </div>
    )
}
