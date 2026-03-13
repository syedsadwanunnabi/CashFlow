"use client";

import React, { useState } from 'react';
import { useCashFlow } from '@/hooks/use-cashflow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Download, Upload, Trash2, Database, Languages, Palette, Smartphone, Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { translations } from '@/lib/translations';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { LinkedAccount } from '@/lib/types';

const BANGLADESH_BANKS = [
  "bKash", "Nagad", "Rocket", "Upay", "Tap", "CellFin",
  "Dutch-Bangla Bank (DBBL)", "City Bank", "Eastern Bank (EBL)", "BRAC Bank", 
  "Pubali Bank", "Sonali Bank", "Islami Bank", "Mutual Trust Bank (MTB)", 
  "United Commercial Bank (UCB)", "Prime Bank", "Bank Asia", "Southeast Bank", 
  "Al-Arafah Bank", "Social Islami Bank", "AB Bank", "Standard Chartered", "HSBC"
];

export default function SettingsPage() {
  const { 
    transactions, categories, accounts, language, theme, 
    saveTransactions, saveCategories, saveSettings, saveAccounts 
  } = useCashFlow();
  const { toast } = useToast();
  const t = translations[language];

  const [newAccName, setNewAccName] = useState('');
  const [newAccNumber, setNewAccNumber] = useState('');
  const [newAccProvider, setNewAccProvider] = useState('bKash');

  const handleAddAccount = () => {
    if (!newAccName || !newAccNumber) return;
    const isMfs = ['bKash', 'Nagad', 'Rocket', 'Upay', 'Tap', 'CellFin'].includes(newAccProvider);
    const newAcc: LinkedAccount = {
      id: crypto.randomUUID(),
      name: newAccName,
      number: newAccNumber,
      type: isMfs ? 'mfs' : 'bank',
      provider: newAccProvider
    };
    saveAccounts([...accounts, newAcc]);
    setNewAccName('');
    setNewAccNumber('');
    toast({ title: "Account Linked", description: `${newAccProvider} account added.` });
  };

  const removeAccount = (id: string) => {
    saveAccounts(accounts.filter(a => a.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{t.settings}</h1>
        <p className="text-muted-foreground">Manage your accounts, themes, and language preferences.</p>
      </div>

      <div className="grid gap-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5 text-primary" />
                {t.language}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={language} onValueChange={(val: any) => saveSettings(val, theme)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="bn">বাংলা (Bangla)</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-accent" />
                {t.theme}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={theme} onValueChange={(val: any) => saveSettings(language, val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default Blue</SelectItem>
                  <SelectItem value="cyan">Deep Cyan</SelectItem>
                  <SelectItem value="pink">Hot Pink</SelectItem>
                  <SelectItem value="dark">Classic Dark</SelectItem>
                  <SelectItem value="midnight">Midnight Blue (Dark)</SelectItem>
                  <SelectItem value="emerald">Forest Emerald (Dark)</SelectItem>
                  <SelectItem value="amethyst">Amethyst Purple (Dark)</SelectItem>
                  <SelectItem value="onyx">Onyx Gold (Dark)</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-emerald-500" />
              {t.linkedAccounts}
            </CardTitle>
            <CardDescription>Link your bKash, Nagad, or Bank account numbers for easier tracking.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Account Name</Label>
                <Input placeholder="Personal bKash" value={newAccName} onChange={e => setNewAccName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Number</Label>
                <Input placeholder="017XXXXXXXX" value={newAccNumber} onChange={e => setNewAccNumber(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select value={newAccProvider} onValueChange={setNewAccProvider}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BANGLADESH_BANKS.map(bank => (
                      <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleAddAccount} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              {t.addAccount}
            </Button>

            <div className="space-y-2 pt-4">
              {accounts.map(acc => (
                <div key={acc.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <div className="font-semibold text-foreground">{acc.name} ({acc.provider})</div>
                    <div className="text-xs text-muted-foreground">{acc.number}</div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeAccount(acc.id)}>
                    <Trash2 className="h-4 w-4 text-rose-500" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="flex-1 h-12" onClick={() => {
                const data = { transactions, categories, accounts, settings: { language, theme } };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `cashflow-backup.json`;
                link.click();
              }}>
                <Download className="mr-2 h-4 w-4" />
                Export Backup
              </Button>
              <div className="relative flex-1">
                <Input 
                  type="file" 
                  className="hidden" 
                  id="import-file" 
                  accept=".json" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const data = JSON.parse(event.target?.result as string);
                        if (data.transactions) saveTransactions(data.transactions);
                        if (data.categories) saveCategories(data.categories);
                        if (data.accounts) saveAccounts(data.accounts);
                        if (data.settings) saveSettings(data.settings.language, data.settings.theme);
                        toast({ title: "Import Successful" });
                      } catch (e) { toast({ variant: "destructive", title: "Import Failed" }); }
                    };
                    reader.readAsText(file);
                  }} 
                />
                <Button asChild variant="outline" className="w-full h-12 cursor-pointer">
                  <label htmlFor="import-file">
                    <Upload className="mr-2 h-4 w-4" />
                    Import Backup
                  </label>
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full sm:w-auto">
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t.clearData}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>This will delete all transactions and linked accounts.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => saveTransactions([])} className="bg-destructive">Delete Everything</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
