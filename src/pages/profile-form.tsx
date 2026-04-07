import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRef, useEffect, useState } from "react"
import { Camera, Save } from "lucide-react"
import { useProfile } from "@/lib/profile-store"

const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, {
      message: "Username must be at least 2 characters.",
    })
    .max(30, {
      message: "Username must not be longer than 30 characters.",
    }),
  bio: z.string().max(160).min(4, { message: "Bio must be at least 4 characters." }),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm() {
  const { profile, updateProfile } = useProfile()
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: profile.username,
      bio: profile.bio
    },
  })

  // Keep form in sync if external profile changes
  useEffect(() => {
    reset({
      username: profile.username,
      bio: profile.bio
    })
    setAvatarPreview(profile.avatar)
  }, [profile, reset])

  function onSubmit(data: ProfileFormValues) {
    updateProfile({
      username: data.username,
      bio: data.bio,
      avatar: avatarPreview
    })
    
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="flex flex-col items-center gap-4 shrink-0">
          <div className="group relative">
            <Avatar className="h-32 w-32 border-4 border-background shadow-xl ring-2 ring-primary/20 transition-all group-hover:ring-primary/40">
              <AvatarImage src={avatarPreview || ""} className="object-cover" />
              <AvatarFallback className="text-3xl">{profile.username.substring(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute bottom-0 right-0 rounded-full shadow-lg transition-transform group-hover:scale-110 active:scale-95"
              onClick={triggerFileInput}
            >
              <Camera className="size-4" />
              <span className="sr-only">Change avatar</span>
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold tracking-tight">Profile Photo</h3>
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              PNG, JPG or GIF. Max 5MB.
            </p>
          </div>
        </div>

        <div className="flex-1 grid gap-6 w-full">
          <div className="grid gap-2">
            <Label htmlFor="username" className="text-sm font-medium">Username</Label>
            <Input id="username" placeholder="aces_user" {...register("username")} className={errors.username ? "border-destructive" : ""} />
            {errors.username && (
              <p className="text-[0.8rem] font-medium text-destructive">{errors.username.message}</p>
            )}
            <p className="text-[0.8rem] text-muted-foreground">
              This is your public display name.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
            <Input id="bio" placeholder="Tell us about yourself" {...register("bio")} className={errors.bio ? "border-destructive" : ""} />
            {errors.bio && (
              <p className="text-[0.8rem] font-medium text-destructive">{errors.bio.message}</p>
            )}
            <p className="text-[0.8rem] text-muted-foreground">
              A brief description for your profile.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-end gap-4 border-t pt-6">
        {saved && (
          <span className="text-sm text-primary font-medium animate-in fade-in">
            ✓ Profile saved!
          </span>
        )}
        <Button variant="outline" type="button" onClick={() => reset({ username: profile.username, bio: profile.bio })}>Cancel</Button>
        <Button type="submit" className="min-w-[120px]">
          <Save className="size-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </form>
  )
}
