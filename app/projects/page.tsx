"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Target, Calendar, TrendingUp, HelpCircle, X } from "lucide-react"
import { useApp } from "@/context/app-context"
import { categoriesInfo } from "@/data/mock-data"
import * as Icons from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { formatDistanceToNow, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { AddProjectForm } from "@/components/forms/add-project-form"

export default function ProjectsPage() {
  const { financialProjects, deleteFinancialProject } = useApp()
  const [selectedProject, setSelectedProject] = useState(financialProjects[0]?.id || "")
  const [showAddProject, setShowAddProject] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const project = financialProjects.find((p) => p.id === selectedProject)

  // Simuler des données de prévision pour le projet sélectionné
  const simulatedData = project
    ? [
        { month: "Avr", balance: 2570 },
        { month: "Mai", balance: project.id === "2" ? 1370 : 2970 },
        { month: "Juin", balance: project.id === "2" ? 770 : 3370 },
        { month: "Juil", balance: project.id === "2" ? 2370 : 1870 },
      ]
    : []

  const handleDeleteProject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
      deleteFinancialProject(id)
      if (selectedProject === id) {
        setSelectedProject(financialProjects.find((p) => p.id !== id)?.id || "")
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">Projets & Simulations</h1>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
        </div>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground"
          onClick={() => setShowAddProject(true)}
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Aide contextuelle */}
      {showHelp && (
        <div className="rounded-xl border bg-muted p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Comment utiliser cette page ?</h2>
            <button onClick={() => setShowHelp(false)} className="rounded-full p-1 hover:bg-background">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 space-y-2 text-sm">
            <p>Cette page vous permet de :</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Créer des projets financiers avec un objectif d'épargne</li>
              <li>Suivre votre progression vers chaque objectif</li>
              <li>Visualiser l'impact de vos projets sur votre solde futur</li>
              <li>Calculer l'épargne mensuelle nécessaire pour atteindre votre objectif</li>
            </ul>
            <p className="mt-2 font-medium">Comment commencer ?</p>
            <p>
              Cliquez sur le bouton + pour créer un nouveau projet, puis définissez un nom, un montant cible, une date
              cible et une catégorie.
            </p>
          </div>
        </div>
      )}

      {/* Liste des projets */}
      <div className="space-y-3">
        <h2 className="font-medium">Mes projets</h2>
        {financialProjects.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {financialProjects.map((p) => {
              const categoryInfo = categoriesInfo[p.category]
              const IconComponent = Icons[categoryInfo.icon as keyof typeof Icons] as LucideIcon
              const progress = (p.currentAmount / p.targetAmount) * 100

              return (
                <div
                  key={p.id}
                  className={`cursor-pointer rounded-xl border bg-card p-4 transition-all hover:border-primary hover:shadow-sm ${
                    selectedProject === p.id ? "border-primary ring-1 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedProject(p.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${categoryInfo.color}`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium">{p.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(parseISO(p.targetDate), { addSuffix: true, locale: fr })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {p.currentAmount} / {p.targetAmount} €
                        </p>
                        <p className="text-xs text-muted-foreground">{progress.toFixed(0)}% complété</p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteProject(e, p.id)}
                        className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border bg-card p-6">
            <p className="mb-2 text-muted-foreground">Aucun projet financier</p>
            <button
              className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1 text-sm font-medium text-primary-foreground"
              onClick={() => setShowAddProject(true)}
            >
              <Plus className="h-4 w-4" /> Ajouter un projet
            </button>
          </div>
        )}
      </div>

      {/* Simulation de l'impact sur le cashflow */}
      {project && (
        <div className="space-y-4 rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Impact sur votre cashflow</h2>
            <div className="rounded-lg bg-primary/10 px-2 py-1 text-xs font-medium text-primary">Simulation</div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col rounded-lg border p-3">
              <span className="text-xs text-muted-foreground">Projet</span>
              <span className="mt-1 font-semibold">{project.name}</span>
              <div className="mt-auto flex items-center gap-1 text-xs">
                <Target className="h-3 w-3" />
                <span>Objectif: {project.targetAmount} €</span>
              </div>
            </div>

            <div className="flex flex-col rounded-lg border p-3">
              <span className="text-xs text-muted-foreground">Date cible</span>
              <span className="mt-1 font-semibold">
                {new Date(project.targetDate).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <div className="mt-auto flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3" />
                <span>{formatDistanceToNow(parseISO(project.targetDate), { addSuffix: true, locale: fr })}</span>
              </div>
            </div>

            <div className="flex flex-col rounded-lg border p-3">
              <span className="text-xs text-muted-foreground">Épargne mensuelle</span>
              <span className="mt-1 font-semibold">
                {(
                  (project.targetAmount - project.currentAmount) /
                  (Math.ceil(
                    (new Date(project.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30),
                  ) || 1)
                ).toFixed(2)}{" "}
                €
              </span>
              <div className="mt-auto flex items-center gap-1 text-xs">
                <TrendingUp className="h-3 w-3" />
                <span>Par mois pour atteindre l'objectif</span>
              </div>
            </div>
          </div>

          <div className="mt-4 h-64">
            <h3 className="mb-4 text-sm font-medium">Prévision de votre solde</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={simulatedData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}€`}
                />
                <Tooltip
                  formatter={(value) => [`${value} €`, "Solde prévu"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "0.5rem",
                    padding: "0.5rem",
                  }}
                />
                <Bar dataKey="balance" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {showAddProject && <AddProjectForm onClose={() => setShowAddProject(false)} />}
    </div>
  )
}
