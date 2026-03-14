import { useApp } from "@/contexts/AppContext";
import type { Transaction } from "@/lib/data";
import AddTransaction from "@/components/AddTransaction";
import TransactionList from "@/components/TransactionList";

interface Props {
  transactions: Transaction[];
  onAdd: (txn: Transaction) => void;
  onUpdate: (txn: Transaction) => void;
  onDelete: (id: string) => void;
}

export default function TransactionsPage({ transactions, onAdd, onUpdate, onDelete }: Props) {
  const { t } = useApp();

  return (
    <div className="space-y-5">
      <AddTransaction onAdd={onAdd} />
      <TransactionList transactions={transactions} onUpdate={onUpdate} onDelete={onDelete} />
    </div>
  );
}
