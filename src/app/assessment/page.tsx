import { ConditionAssessment } from "@/components/condition-assessment";

export default function AssessmentPage() {
    return (
        <div className="p-4 md:p-8 animate-fade-in">
            <h2 className="text-3xl font-bold font-headline text-foreground mb-8">
                AI Condition Assessment
            </h2>
            <ConditionAssessment />
        </div>
    )
}
