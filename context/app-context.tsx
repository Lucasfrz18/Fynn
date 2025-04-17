"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User as AuthUser } from "@supabase/supabase-js";
import type { User, FinancialSummary, Transaction, RecurringPayment, FinancialProject, UserPreferences } from "@/types/supabase"; // Assure-toi que ce chemin est correct
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";

// --- AJUSTEMENT DES TYPES ---
// Adapte FinancialSummary si daily_budget_remaining n'est pas utilisé/n'existe pas
interface AdjustedFinancialSummary extends Omit<FinancialSummary, 'dailyBudgetRemaining'> {
  // Ajoute d'autres champs si nécessaire
}

// Adapte UserPreferences si onboarding_complete n'est pas utilisé
interface AdjustedUserPreferences extends Omit<UserPreferences, 'onboarding_complete'> {
    // Ajoute d'autres champs si nécessaire
}

// Interface pour la valeur du contexte (utilise les types ajustés)
interface AppContextType {
  user: User | null;
  financialSummary: AdjustedFinancialSummary | null; // Utilise le type ajusté
  transactions: Transaction[];
  recurringPayments: RecurringPayment[];
  financialProjects: FinancialProject[];
  isLoading: boolean;
  isFirstTime: boolean;
  // --- Fonctions ---
  updateUser: (user: Partial<User>) => Promise<void>;
  updateFinancialSummary: (summary: Partial<AdjustedFinancialSummary>) => Promise<void>; // Utilise le type ajusté
  addTransaction: (transaction: Omit<Transaction, "id" | "userId" | "created_at" | "updated_at">) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addRecurringPayment: (payment: Omit<RecurringPayment, "id" | "userId" | "created_at" | "updated_at">) => Promise<void>;
  updateRecurringPayment: (id: string, payment: Partial<RecurringPayment>) => Promise<void>;
  deleteRecurringPayment: (id: string) => Promise<void>;
  addFinancialProject: (project: Omit<FinancialProject, "id" | "userId" | "created_at" | "updated_at">) => Promise<void>;
  updateFinancialProject: (id: string, project: Partial<FinancialProject>) => Promise<void>;
  deleteFinancialProject: (id: string) => Promise<void>;
  uploadProfileImage: (file: File) => Promise<void>;
  // completeOnboarding: () => Promise<void>; // COMMENTÉ - Décommente si colonne ajoutée
}

// Création du contexte
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider du contexte
export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser, loading: authLoading } = useAuth();

  // États locaux
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false); // Sera déterminé dans useEffect
  const [user, setUser] = useState<User | null>(null);
  const [financialSummary, setFinancialSummary] = useState<AdjustedFinancialSummary | null>(null); // Type ajusté
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([]);
  const [financialProjects, setFinancialProjects] = useState<FinancialProject[]>([]);

  // --- useEffect pour charger TOUTES les données ---
  useEffect(() => {
    const loadUserData = async () => {
      if (!authUser || authLoading) {
        if (!authUser) {
            setUser(null);
            setFinancialSummary(null);
            setTransactions([]);
            setRecurringPayments([]);
            setFinancialProjects([]);
            setIsFirstTime(false);
            setIsLoading(false);
        }
        return;
      }

      if (!supabase) {
          console.error("Client Supabase non initialisé !");
          setIsLoading(false);
          return;
      }

      console.log("Auth user disponible, chargement des données...");
      setIsLoading(true);

      try {
        // --- 1. Chargement Profil ---
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, name, email, avatar")
          .eq("id", authUser.id)
          .maybeSingle();
        if (profileError && profileError.code !== 'PGRST116') throw profileError;
        setUser(profileData ? { id: profileData.id, name: profileData.name || "Utilisateur", email: profileData.email || authUser.email || "", avatar: profileData.avatar || undefined } : { id: authUser.id, name: "Utilisateur", email: authUser.email || "", avatar: undefined });

        // --- 2. Chargement Résumé Financier (avec mapping et sans daily_budget_remaining) ---
        const { data: summaryData, error: summaryError } = await supabase
          .from('financial_summaries')
          .select('id, user_id, current_balance, health_status, monthly_income, monthly_expenses, recurring_payments') // Sélectionne les colonnes existantes
          .eq('user_id', authUser.id)
          .maybeSingle();
        if (summaryError && summaryError.code !== 'PGRST116') throw summaryError;
        setFinancialSummary(summaryData ? {
              id: summaryData.id, userId: summaryData.user_id, currentBalance: summaryData.current_balance ?? 0,
              healthStatus: summaryData.health_status ?? 'good', monthlyIncome: summaryData.monthly_income ?? 0,
              monthlyExpenses: summaryData.monthly_expenses ?? 0, recurringPayments: summaryData.recurring_payments ?? 0
           } : { id: '', userId: authUser.id, currentBalance: 0, healthStatus: 'good', monthlyIncome: 0, monthlyExpenses: 0, recurringPayments: 0 });

        // --- 3. Chargement Transactions (avec mapping) ---
        const { data: transactionsData, error: transactionsError } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", authUser.id)
          .order("date", { ascending: false });
        if (transactionsError) throw transactionsError;
        setTransactions(transactionsData?.map((t: any) => ({
            id: t.id, userId: t.user_id, amount: t.amount ?? 0, date: t.date,
            description: t.description ?? '', category: t.category,
            isRecurring: t.is_recurring ?? false, // Map DB -> JS
            transactionType: t.transaction_type, // Map DB -> JS
            created_at: t.created_at, updated_at: t.updated_at
        })) || []);

        // --- 4. Chargement Prélèvements Récurrents (avec mapping) ---
        const { data: paymentsData, error: paymentsError } = await supabase
          .from("recurring_payments")
          .select("*")
          .eq("user_id", authUser.id)
          .order("date", { ascending: true });
        if (paymentsError) throw paymentsError;
        setRecurringPayments(paymentsData?.map((p: any) => ({
            id: p.id, userId: p.user_id, name: p.name ?? '', amount: p.amount ?? 0,
            date: p.date, category: p.category,
            isActive: p.is_active ?? true, // Map DB -> JS
            created_at: p.created_at, updated_at: p.updated_at
        })) || []);

        // --- 5. Chargement Projets Financiers (avec mapping) ---
        const { data: projectsData, error: projectsError } = await supabase
          .from("financial_projects")
          .select("*")
          .eq("user_id", authUser.id);
        if (projectsError) throw projectsError;
        setFinancialProjects(projectsData?.map((p: any) => ({
            id: p.id, userId: p.user_id, name: p.name ?? '',
            targetAmount: p.target_amount ?? 0, // Map DB -> JS
            currentAmount: p.current_amount ?? 0, // Map DB -> JS
            targetDate: p.target_date, // Map DB -> JS (si type date/timestamp)
            category: p.category,
            created_at: p.created_at, updated_at: p.updated_at
        })) || []);

        // --- 6. Chargement Préférences (pour isFirstTime) ---
        // !! Cette logique suppose qu'une ligne est créée SEULEMENT APRES l'onboarding.
        // !! Si vous ajoutez la colonne 'onboarding_complete', modifiez cette logique.
        const { data: preferencesData, error: preferencesError } = await supabase
            .from("user_preferences")
            .select("id") // Juste besoin de savoir si ça existe
            // .select("id, onboarding_complete") // DECOMMENTER SI onboarding_complete EST AJOUTÉ
            .eq("user_id", authUser.id)
            .maybeSingle();
        if (preferencesError && preferencesError.code !== 'PGRST116') throw preferencesError;

        if (preferencesData === null) {
            // Si pas de ligne de préférences, on suppose que c'est la première fois
            console.log("Aucune préférence trouvée, marquer comme première utilisation.");
            setIsFirstTime(true);
        } else {
             // Si une ligne existe, on suppose que l'onboarding est fait (ou non nécessaire)
             // // DECOMMENTER SI onboarding_complete EST AJOUTÉ:
             // if (preferencesData.onboarding_complete === true) {
             //     setIsFirstTime(false);
             // } else {
             //     setIsFirstTime(true); // Marquer comme première fois si la colonne existe mais est false
             // }
             setIsFirstTime(false); // Version simple : si la ligne existe, ce n'est pas la 1ère fois
        }

        console.log("Chargement des données terminé.");

      } catch (error: any) {
          console.error("Erreur globale lors du chargement des données:", error.message || error);
          toast.error("Erreur lors du chargement des données.");
          // Réinitialise en cas d'erreur grave
          setUser(null); setFinancialSummary(null); setTransactions([]);
          setRecurringPayments([]); setFinancialProjects([]); setIsFirstTime(false);
      } finally {
          setIsLoading(false);
      }
    }; // Fin de loadUserData

    loadUserData();

  }, [authUser, authLoading]); // Dépendances


  // --- Définition des fonctions pour modifier les données ---

  const calculateStats = useCallback(async () => {
    if (!authUser || !financialSummary || !supabase) return;

    const currentTransactions = transactions;
    const currentRecurringPayments = recurringPayments;

    const totalIncome = currentTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = currentTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalRecurring = currentRecurringPayments.filter(p => p.isActive).reduce((sum, p) => sum + p.amount, 0); // Utilise isActive (JS)

    const newSummaryData: Partial<AdjustedFinancialSummary> = {
      monthlyIncome: totalIncome,
      monthlyExpenses: totalExpenses,
      recurringPayments: totalRecurring,
    };

    setFinancialSummary(prev => prev ? { ...prev, ...newSummaryData } : null);

    try {
      const { error } = await supabase
        .from('financial_summaries')
        .update({ // Map vers noms DB
          monthly_income: newSummaryData.monthlyIncome,
          monthly_expenses: newSummaryData.monthlyExpenses,
          recurring_payments: newSummaryData.recurringPayments,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', authUser.id);

      if (error) {
        console.error("Erreur maj stats dans DB:", error.message);
        toast.error("Erreur mise à jour statistiques.");
      }
    } catch (e) {
      console.error("Exception maj stats DB:", e);
      toast.error("Erreur serveur stats.");
    }
  }, [authUser, transactions, recurringPayments, financialSummary, supabase]);

  // USER / PROFILE
  const updateUser = async (userData: Partial<User>) => {
    if (!authUser || !supabase) return;
    const { id, email, ...updateData } = userData;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", authUser.id)
        .select()
        .single();
      if (error) throw error;
      if (!data) throw new Error("Profil non trouvé après mise à jour.");

      setUser((prev) => (prev ? { ...prev, ...data } : null));
      toast.success("Profil mis à jour");
    } catch (error: any) {
      console.error("Erreur mise à jour utilisateur:", error.message);
      toast.error("Erreur mise à jour profil.");
    }
  };

  const uploadProfileImage = async (file: File) => {
    if (!authUser || !supabase) return;
    const fileExt = file.name.split('.').pop();
    const filePath = `${authUser.id}/avatar-${Date.now()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars') // <<< CONFIRME CE NOM DE BUCKET
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath); // <<< CONFIRME CE NOM
      if (!urlData || !urlData.publicUrl) throw new Error("URL publique non trouvée.");

      await updateUser({ avatar: urlData.publicUrl }); // Réutilise updateUser
      // toast.success("Image mise à jour"); // Déjà fait dans updateUser
    } catch (error: any) {
      console.error("Erreur upload image:", error.message);
      toast.error("Erreur envoi image.");
    }
  };

  // FINANCIAL SUMMARY
  const updateFinancialSummary = async (summaryData: Partial<AdjustedFinancialSummary>) => {
    if (!authUser || !supabase || !financialSummary) return;
    const { id, userId, ...updateData } = summaryData;

    // Crée l'objet pour la DB (pas de mapping nécessaire ici car noms identiques)
     const dbUpdateData = { ...updateData, updated_at: new Date().toISOString() };

    try {
      const { error } = await supabase
        .from("financial_summaries")
        .update(dbUpdateData)
        .eq("user_id", authUser.id);
      if (error) throw error;

      setFinancialSummary((prev) => (prev ? { ...prev, ...updateData } : null));
      toast.success("Résumé mis à jour");
    } catch (error: any) {
      console.error("Erreur mise à jour résumé:", error.message);
      toast.error("Erreur mise à jour résumé.");
    }
  };

  // TRANSACTIONS
  const addTransaction = async (transaction: Omit<Transaction, "id" | "userId" | "created_at" | "updated_at">) => {
    if (!authUser || !supabase) return;
    try {
      const dbTransaction = { // Map JS -> DB
        user_id: authUser.id,
        amount: transaction.amount, date: transaction.date, description: transaction.description, category: transaction.category,
        is_recurring: transaction.isRecurring, // Map JS -> DB
        transaction_type: transaction.transactionType, // Map JS -> DB
      };
      const { data, error } = await supabase.from("transactions").insert(dbTransaction).select().single();
      if (error) throw error;
      if (!data) throw new Error("Aucune donnée retournée après insertion.");

      const newTransaction: Transaction = { // Map DB -> JS
          id: data.id, userId: data.user_id, amount: data.amount, date: data.date, description: data.description, category: data.category,
          isRecurring: data.is_recurring, // Map DB -> JS
          transactionType: data.transaction_type, // Map DB -> JS
          created_at: data.created_at, updated_at: data.updated_at,
      };
      setTransactions(prev => [newTransaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      await calculateStats();
      toast.success("Transaction ajoutée");
    } catch (error: any) {
      console.error("Erreur ajout transaction:", error.message);
      toast.error("Erreur ajout transaction.");
    }
  };

  const updateTransaction = async (id: string, transactionUpdate: Partial<Transaction>) => {
    if (!authUser || !supabase) return;
    const { id: txId, userId, created_at, updated_at, ...updateData } = transactionUpdate;
    const dbUpdateData: any = { updated_at: new Date().toISOString() };
    // Map JS -> DB pour les champs modifiés
    if ('amount' in updateData) dbUpdateData.amount = updateData.amount;
    if ('date' in updateData) dbUpdateData.date = updateData.date;
    if ('description' in updateData) dbUpdateData.description = updateData.description;
    if ('category' in updateData) dbUpdateData.category = updateData.category;
    if ('isRecurring' in updateData) dbUpdateData.is_recurring = updateData.isRecurring; // Map
    if ('transactionType' in updateData) dbUpdateData.transaction_type = updateData.transactionType; // Map

    try {
      const { data, error } = await supabase.from("transactions").update(dbUpdateData).eq("id", id).eq("user_id", authUser.id).select().single();
      if (error) throw error;
      if (!data) throw new Error("Aucune donnée après maj transaction.");

      const updatedTransaction: Transaction = { // Map DB -> JS
          id: data.id, userId: data.user_id, amount: data.amount, date: data.date, description: data.description, category: data.category,
          isRecurring: data.is_recurring, transactionType: data.transaction_type,
          created_at: data.created_at, updated_at: data.updated_at,
      };
      setTransactions(prev => prev.map(t => t.id === id ? updatedTransaction : t).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      await calculateStats();
      toast.success("Transaction mise à jour");
    } catch (error: any) {
      console.error("Erreur maj transaction:", error.message);
      toast.error("Erreur mise à jour transaction.");
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!authUser || !supabase) return;
    const transactionToDelete = transactions.find(t => t.id === id);
    setTransactions((prev) => prev.filter((t) => t.id !== id)); // Optimistic UI
    try {
      const { error } = await supabase.from("transactions").delete().eq("id", id).eq("user_id", authUser.id);
      if (error) { // Annule si erreur
          if (transactionToDelete) setTransactions(prev => [...prev, transactionToDelete].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
          throw error;
      }
      await calculateStats();
      toast.success("Transaction supprimée");
    } catch (error: any) {
      console.error("Erreur suppression transaction:", error.message);
      toast.error("Erreur suppression transaction.");
    }
  };

  // RECURRING PAYMENTS
  const addRecurringPayment = async (payment: Omit<RecurringPayment, "id" | "userId" | "created_at" | "updated_at">) => {
     if (!authUser || !supabase) return;
     try {
        const dbPayment = { // Map JS -> DB
            user_id: authUser.id, name: payment.name, amount: payment.amount, date: payment.date, category: payment.category,
            is_active: payment.isActive, // Map JS -> DB
        };
        const { data, error } = await supabase.from("recurring_payments").insert(dbPayment).select().single();
        if (error) throw error;
        if (!data) throw new Error("Aucune donnée retournée.");

        const newPayment: RecurringPayment = { // Map DB -> JS
            id: data.id, userId: data.user_id, name: data.name, amount: data.amount, date: data.date, category: data.category,
            isActive: data.is_active, // Map DB -> JS
            created_at: data.created_at, updated_at: data.updated_at,
        };
        setRecurringPayments(prev => [...prev, newPayment].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        await calculateStats();
        toast.success("Prélèvement ajouté");
     } catch (error: any) {
        console.error("Erreur ajout prélèvement:", error.message);
        toast.error("Erreur ajout prélèvement.");
     }
  };

  const updateRecurringPayment = async (id: string, paymentUpdate: Partial<RecurringPayment>) => {
      if (!authUser || !supabase) return;
      const { id: pId, userId, created_at, updated_at, ...updateData } = paymentUpdate;
      const dbUpdateData: any = { updated_at: new Date().toISOString() };
      // Map JS -> DB pour les champs modifiés
      if ('name' in updateData) dbUpdateData.name = updateData.name;
      if ('amount' in updateData) dbUpdateData.amount = updateData.amount;
      if ('date' in updateData) dbUpdateData.date = updateData.date;
      if ('category' in updateData) dbUpdateData.category = updateData.category;
      if ('isActive' in updateData) dbUpdateData.is_active = updateData.isActive; // Map

      try {
          const { data, error } = await supabase.from('recurring_payments').update(dbUpdateData).eq('id', id).eq('user_id', authUser.id).select().single();
          if (error) throw error;
          if (!data) throw new Error("Aucune donnée après maj.");

          const updatedPayment: RecurringPayment = { // Map DB -> JS
               id: data.id, userId: data.user_id, name: data.name, amount: data.amount, date: data.date, category: data.category,
               isActive: data.is_active, // Map DB -> JS
               created_at: data.created_at, updated_at: data.updated_at,
           };
          setRecurringPayments(prev => prev.map(p => p.id === id ? updatedPayment : p).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
          await calculateStats();
          toast.success('Prélèvement mis à jour');
      } catch (error: any) {
          console.error("Erreur maj prélèvement:", error.message);
          toast.error("Erreur maj prélèvement.");
      }
  };

  const deleteRecurringPayment = async (id: string) => {
      if (!authUser || !supabase) return;
      const paymentToDelete = recurringPayments.find(p => p.id === id);
      setRecurringPayments((prev) => prev.filter((p) => p.id !== id)); // Optimistic UI
      try {
          const { error } = await supabase.from('recurring_payments').delete().eq('id', id).eq('user_id', authUser.id);
          if (error) {
              if (paymentToDelete) setRecurringPayments(prev => [...prev, paymentToDelete].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
              throw error;
          }
          await calculateStats();
          toast.success("Prélèvement supprimé");
      } catch (error: any) {
          console.error("Erreur suppression prélèvement:", error.message);
          toast.error("Erreur suppression prélèvement.");
      }
  };

  // FINANCIAL PROJECTS
  const addFinancialProject = async (project: Omit<FinancialProject, "id" | "userId" | "created_at" | "updated_at">) => {
      if (!authUser || !supabase) return;
      try {
          const dbProject = { // Map JS -> DB
              user_id: authUser.id, name: project.name, category: project.category,
              target_amount: project.targetAmount, // Map
              current_amount: project.currentAmount, // Map
              target_date: project.targetDate, // Map
          };
          const { data, error } = await supabase.from('financial_projects').insert(dbProject).select().single();
          if (error) throw error;
          if (!data) throw new Error("Aucune donnée retournée.");

          const newProject: FinancialProject = { // Map DB -> JS
              id: data.id, userId: data.user_id, name: data.name, category: data.category,
              targetAmount: data.target_amount, // Map
              currentAmount: data.current_amount, // Map
              targetDate: data.target_date, // Map
              created_at: data.created_at, updated_at: data.updated_at,
          };
          setFinancialProjects(prev => [...prev, newProject]);
          toast.success("Projet ajouté");
      } catch (error: any) {
          console.error("Erreur ajout projet:", error.message);
          toast.error("Erreur ajout projet.");
      }
  };

  const updateFinancialProject = async (id: string, projectUpdate: Partial<FinancialProject>) => {
      if (!authUser || !supabase) return;
      const { id: projId, userId, created_at, updated_at, ...updateData } = projectUpdate;
      const dbUpdateData: any = { updated_at: new Date().toISOString() };
       // Map JS -> DB
      if ('name' in updateData) dbUpdateData.name = updateData.name;
      if ('category' in updateData) dbUpdateData.category = updateData.category;
      if ('targetAmount' in updateData) dbUpdateData.target_amount = updateData.targetAmount; // Map
      if ('currentAmount' in updateData) dbUpdateData.current_amount = updateData.currentAmount; // Map
      if ('targetDate' in updateData) dbUpdateData.target_date = updateData.targetDate; // Map

      try {
          const { data, error } = await supabase.from('financial_projects').update(dbUpdateData).eq('id', id).eq('user_id', authUser.id).select().single();
          if (error) throw error;
          if (!data) throw new Error("Aucune donnée retournée.");

          const updatedProject: FinancialProject = { // Map DB -> JS
               id: data.id, userId: data.user_id, name: data.name, category: data.category,
               targetAmount: data.target_amount, currentAmount: data.current_amount, targetDate: data.target_date,
               created_at: data.created_at, updated_at: data.updated_at,
           };
          setFinancialProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
          toast.success('Projet mis à jour');
      } catch (error: any) {
          console.error("Erreur maj projet:", error.message);
          toast.error("Erreur maj projet.");
      }
  };

  const deleteFinancialProject = async (id: string) => {
      if (!authUser || !supabase) return;
      const projectToDelete = financialProjects.find(p => p.id === id);
      setFinancialProjects((prev) => prev.filter((p) => p.id !== id)); // Optimistic UI
      try {
          const { error } = await supabase.from('financial_projects').delete().eq('id', id).eq('user_id', authUser.id);
          if (error) {
              if (projectToDelete) setFinancialProjects(prev => [...prev, projectToDelete]);
              throw error;
          }
          toast.success("Projet supprimé");
      } catch (error: any) {
          console.error("Erreur suppression projet:", error.message);
          toast.error("Erreur suppression projet.");
      }
  };

  // --- ONBOARDING ---
  // !! COMMENTÉ PAR DÉFAUT - Nécessite la colonne 'onboarding_complete' (boolean) dans 'user_preferences'
  /* // DECOMMENTER SI onboarding_complete EST AJOUTÉ DANS SUPABASE
  const completeOnboarding = async () => {
      if (!authUser || !supabase) return;
      try {
          const { error } = await supabase
              .from('user_preferences')
              .upsert(
                  { user_id: authUser.id, onboarding_complete: true }, // Mappe vers colonne DB
                  { onConflict: 'user_id' }
              );
          if (error) throw error;
          setIsFirstTime(false); // Met à jour l'état local
          toast.success("Configuration terminée !");
      } catch (error: any) {
          console.error("Erreur complétion onboarding:", error.message);
          toast.error("Erreur finalisation configuration.");
      }
  };
  */


  // --- Valeur fournie par le contexte ---
  const value: AppContextType = {
    user,
    financialSummary,
    transactions,
    recurringPayments,
    financialProjects,
    isLoading,
    isFirstTime,
    // --- Fonctions ---
    updateUser,
    updateFinancialSummary,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addRecurringPayment,
    updateRecurringPayment,
    deleteRecurringPayment,
    addFinancialProject,
    updateFinancialProject,
    deleteFinancialProject,
    uploadProfileImage,
    // completeOnboarding, // COMMENTÉ - Décommente si défini et colonne ajoutée
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook pour consommer le contexte
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp doit être utilisé à l'intérieur d'un AppProvider");
  }
  return context;
}