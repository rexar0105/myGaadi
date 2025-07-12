import { IndianRupee } from "lucide-react";
import { expenses } from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ExpensesPage() {
    const recentExpenses = expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

    return (
        <div className="p-4 md:p-8">
            <h2 className="text-3xl font-bold font-headline text-foreground mb-8">
                Recent Expenses
            </h2>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <IndianRupee className="text-primary" /> Recent Expenses
                </CardTitle>
                <CardDescription>Last 10 recorded expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {recentExpenses.map((expense) => (
                    <li key={expense.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{expense.description}</p>
                        <p className="text-sm text-muted-foreground">{expense.vehicleName} - {expense.category}</p>
                      </div>
                      <p className="font-mono font-semibold text-foreground">₹{expense.amount.toLocaleString('en-IN')}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
        </div>
    )
}
