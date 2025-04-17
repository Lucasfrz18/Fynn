"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { X, ImageIcon, Camera, Trash2 } from "lucide-react"
import { useApp } from "@/context/app-context"
import Image from "next/image"

interface ProfilePhotoModalProps {
  onClose: () => void
}

export function ProfilePhotoModal({ onClose }: ProfilePhotoModalProps) {
  const { user, updateUser } = useApp()
  const [previewImage, setPreviewImage] = useState<string | null>(user?.avatar || null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Réinitialiser l'erreur lorsque l'utilisateur change d'image
  useEffect(() => {
    setError(null)
  }, [previewImage])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("L'image est trop volumineuse (max 5MB)")
        return
      }

      // Vérifier le type de fichier
      if (!file.type.startsWith("image/")) {
        setError("Veuillez sélectionner une image valide")
        return
      }

      // Créer une URL pour la prévisualisation
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (!previewImage) {
      onClose()
      return
    }

    try {
      setIsUploading(true)
      setError(null)
      console.log("Enregistrement de l'image de profil")

      // Mettre à jour l'avatar de l'utilisateur
      await updateUser({
        avatar: previewImage,
      })

      setSuccess("Photo de profil mise à jour avec succès!")

      // Fermer la modal après un court délai
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error) {
      console.error("Erreur lors de l'upload de l'image:", error)
      setError("Une erreur est survenue lors de l'enregistrement de l'image")
    } finally {
      setIsUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const removeImage = async () => {
    try {
      setIsUploading(true)
      setError(null)
      console.log("Suppression de l'image de profil")

      setPreviewImage(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Supprimer l'avatar de l'utilisateur
      await updateUser({
        avatar: undefined,
      })

      setSuccess("Photo de profil supprimée avec succès!")

      // Fermer la modal après un court délai
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error) {
      console.error("Erreur lors de la suppression de l'image:", error)
      setError("Une erreur est survenue lors de la suppression de l'image")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-background p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Photo de profil</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative h-32 w-32 overflow-hidden rounded-full bg-primary/10">
            {previewImage ? (
              <Image
                src={previewImage || "/placeholder.svg"}
                alt="Profile"
                width={128}
                height={128}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-primary">
                <span className="text-4xl font-bold">{user?.name ? user.name.charAt(0) : "U"}</span>
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-red-100 p-2 text-center text-sm text-red-500 dark:bg-red-900 dark:text-red-100">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-green-100 p-2 text-center text-sm text-green-500 dark:bg-green-900 dark:text-green-100">
              {success}
            </div>
          )}

          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

          <div className="flex gap-2">
            <button
              onClick={triggerFileInput}
              className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
              disabled={isUploading}
            >
              <Camera className="h-4 w-4" /> Prendre une photo
            </button>

            <button
              onClick={triggerFileInput}
              className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
              disabled={isUploading}
            >
              <ImageIcon className="h-4 w-4" /> Choisir une image
            </button>
          </div>

          <div className="flex gap-2 w-full">
            {previewImage && (
              <button
                onClick={removeImage}
                className="flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                disabled={isUploading}
              >
                {isUploading ? (
                  "Suppression..."
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" /> Supprimer
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleSave}
              className={`flex items-center gap-2 rounded-lg ${previewImage ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"} px-4 py-2 text-sm font-medium ${previewImage ? "flex-1" : "w-full"}`}
              disabled={isUploading || !previewImage}
            >
              {isUploading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
