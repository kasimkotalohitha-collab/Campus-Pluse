import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, ImagePlus, Loader2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from "@/components/ui/select";
import { AIAnalysisCard } from "@/components/ai-analysis-card";
import { analyzeComplaint } from "@/lib/ai-service";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import type {
Category,
ComplaintStatus,
Priority,
} from "@/types";

export const Route = createFileRoute("/app/submit")({
component: SubmitPage,
});

const CATEGORIES: Category[] = [
"Electrical",
"Plumbing",
"Cleanliness",
"Internet & IT",
"Furniture",
"Safety & Security",
"Food Services",
"Academics",
"Transportation",
"Other",
];

const BUILDINGS = [
"Main Academic Block",
"Library",
"Hostel A",
"Hostel B",
"Hostel C",
"Cafeteria",
"Science Complex",
"Sports Complex",
"Auditorium",
"Admin Block",
];

const URGENCIES: Priority[] = ["Low", "Medium", "High", "Critical"];

const MAX_DESC = 800;

function SubmitPage() {
const { user } = useAuth();
const navigate = useNavigate();

const [title, setTitle] = useState("");
const [description, setDescription] = useState("");
const [category, setCategory] = useState<Category>("Other");
const [building, setBuilding] = useState<string>(BUILDINGS[0]);
const [location, setLocation] = useState("");
const [urgency, setUrgency] = useState<Priority>("Medium");
const [anonymous, setAnonymous] = useState(false);
const [images, setImages] = useState<string[]>([]);
const [submitting, setSubmitting] = useState(false);
const [dragOver, setDragOver] = useState(false);
const [done, setDone] = useState(false);

const analysis = useMemo(
() =>
title.length + description.length > 8
? analyzeComplaint(title, description)
: null,
[title, description],
);

function handleFiles(files: FileList | null) {
if (!files) return;


const readers = Array.from(files)
  .slice(0, 4)
  .map(
    (file) =>
      new Promise<string>((resolve) => {
        const reader = new FileReader();

        reader.onload = () => {
          resolve(reader.result as string);
        };

        reader.readAsDataURL(file);
      }),
  );

Promise.all(readers).then((urls) => {
  setImages((previous) => [...previous, ...urls].slice(0, 4));
});


}

async function onSubmit(e: React.FormEvent) {
e.preventDefault();


if (!title.trim() || !description.trim()) {
  toast.error("Please fill in title and description");
  return;
}

if (!user) {
  toast.error("You must be logged in to submit a complaint");
  return;
}

setSubmitting(true);

try {
  const ai = analysis ?? analyzeComplaint(title, description);
  const now = new Date().toISOString();

  const initialStatus: ComplaintStatus = "Submitted";

  const { data, error } = await supabase
    .from("complaints")
    .insert({
      title: title.trim(),
      description: description.trim(),
      category,
      priority: urgency,
      status: initialStatus,
      location: location.trim() || "N/A",
      submitted_by: user.id,
      created_at: now,
      updated_at: now,
      building,
      anonymous,
      images,
      submitted_by_name: anonymous ? "Anonymous" : user.name,
      department: ai.department,
      ai,
      timeline: [
        {
          id: `t-${Date.now()}`,
          status: initialStatus,
          note: "Complaint received.",
          actor: "System",
          timestamp: now,
        },
      ],
      comments: [],
    })
    .select()
    .single();

  if (error) {
    console.error("Supabase complaint submission error:", error);
    toast.error(error.message || "Could not submit the complaint");
    return;
  }

  if (!data) {
    toast.error("Complaint was not returned after submission");
    return;
  }

  setDone(true);
  toast.success("Complaint submitted successfully!");

  setTimeout(() => {
    navigate({
      to: "/app/complaints/$id",
      params: {
        id: data.id,
      },
    });
  }, 1200);
} catch (error) {
  console.error("Unexpected complaint submission error:", error);
  toast.error("Something went wrong while submitting the complaint");
} finally {
  setSubmitting(false);
}


}

if (done) {
return ( <div className="flex min-h-[60vh] items-center justify-center"> <Card className="p-10 text-center"> <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success"> <CheckCircle2 className="h-8 w-8 animate-in zoom-in duration-500" /> </div>

```
      <h2 className="mt-4 text-xl font-semibold">
        Complaint submitted!
      </h2>

      <p className="mt-1 text-sm text-muted-foreground">
        Redirecting to your complaint...
      </p>
    </Card>
  </div>
);


}

return ( <div className="mx-auto max-w-6xl space-y-6"> <div> <h1 className="text-2xl font-semibold tracking-tight">
Submit a complaint </h1>

    <p className="text-sm text-muted-foreground">
      Provide details and our AI will classify it in real time.
    </p>
  </div>

  <div className="grid gap-6 lg:grid-cols-3">
    <form onSubmit={onSubmit} className="space-y-5 lg:col-span-2">
      <Card className="p-6">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Complaint title *</Label> 

            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Flickering lights in Lab 204"
              maxLength={120}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">
                Description *
              </Label>

              <span className="text-xs text-muted-foreground">
                {description.length}/{MAX_DESC}
              </span>
            </div>

            <Textarea
              id="description"
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value.slice(0, MAX_DESC),
                )
              }
              placeholder="Describe the issue in detail — when it started, who is affected..."
              rows={5}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>

              <Select
                value={category}
                onValueChange={(value) =>
                  setCategory(value as Category)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {CATEGORIES.map((item) => (
                    <SelectItem
                      key={item}
                      value={item}
                    >
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Building</Label>

              <Select
                value={building}
                onValueChange={setBuilding}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {BUILDINGS.map((item) => (
                    <SelectItem
                      key={item}
                      value={item}
                    >
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">
                Specific location
              </Label>

              <Input
                id="location"
                value={location}
                onChange={(e) =>
                  setLocation(e.target.value)
                }
                placeholder="e.g. Room 204, 2nd floor"
              />
            </div>

            <div className="space-y-2">
              <Label>Urgency</Label>

              <Select
                value={urgency}
                onValueChange={(value) =>
                  setUrgency(value as Priority)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {URGENCIES.map((item) => (
                    <SelectItem
                      key={item}
                      value={item}
                    >
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Attach photos</Label>

            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFiles(e.dataTransfer.files);
              }}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-muted/40"
              }`}
            >
              <ImagePlus className="h-6 w-6 text-muted-foreground" />

              <p className="text-sm font-medium">
                Drop images or click to upload
              </p>

              <p className="text-xs text-muted-foreground">
                Up to 4 images • PNG, JPG
              </p>

              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) =>
                  handleFiles(e.target.files)
                }
              />
            </label>

            {images.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {images.map((src, index) => (
                  <div
                    key={index}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-border"
                  >
                    <img
                      src={src}
                      alt=""
                      className="h-full w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setImages(
                          images.filter(
                            (_, imageIndex) =>
                              imageIndex !== index,
                          ),
                        )
                      }
                      className="absolute right-1 top-1 rounded-full bg-background/80 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
            <div>
              <Label
                htmlFor="anon"
                className="font-medium"
              >
                Submit anonymously
              </Label>

              <p className="text-xs text-muted-foreground">
                Your identity won't be shown to the admin
                team.
              </p>
            </div>

            <Switch
              id="anon"
              checked={anonymous}
              onCheckedChange={setAnonymous}
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            navigate({
              to: "/app/dashboard",
            })
          }
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={submitting}
          className="gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Submit complaint
            </>
          )}
        </Button>
      </div>
    </form>

    <div className="space-y-4">
      {analysis ? (
        <AIAnalysisCard analysis={analysis} />
      ) : (
        <Card className="p-6 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>

          <h3 className="mt-3 text-sm font-semibold">
            AI Analysis
          </h3>

          <p className="mt-1 text-xs text-muted-foreground">
            Start typing your complaint — we'll classify it
            automatically.
          </p>
        </Card>
      )}

      <Card className="p-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Tips
        </h4>

        <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
          <li>• Be specific about location & time</li>
          <li>• Add photos when possible</li>
          <li>• Choose the right urgency</li>
          <li>• Use anonymous for sensitive issues</li>
        </ul>
      </Card>
    </div>
  </div>
</div>


);
}
