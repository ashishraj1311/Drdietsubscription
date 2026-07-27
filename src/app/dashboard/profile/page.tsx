"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, CardBody, Input } from "@/components/ui";
import { useAuth } from "@/lib/providers";
import { useDashboardData } from "@/lib/hooks/useDashboardData";

export default function ProfilePage() {
  const router = useRouter();
  const { user, hydrated, updateUser, signOut } = useAuth();
  const { subscription } = useDashboardData();
  const [name, setName] = useState("");
  const [notif, setNotif] = useState({ delivery: true, offers: false, progress: true });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    // Seed the editable name field from the loaded user.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user) setName(user.name === "Guest" ? "" : user.name);
  }, [user]);

  if (!hydrated || !user) {
    return <p className="py-10 text-center text-sm text-muted">Loading…</p>;
  }

  function deleteAccount() {
    if (typeof window !== "undefined") {
      Object.keys(localStorage)
        .filter((k) => k.startsWith("drdiet."))
        .forEach((k) => localStorage.removeItem(k));
    }
    signOut();
    router.replace("/");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      {/* Account */}
      <Card>
        <CardBody className="space-y-3">
          <p className="text-sm font-semibold">Account</p>
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Field label="Phone" value={user.phone ? `+91 ${user.phone}` : "—"} verified={user.phone_verified} />
            <Field label="Email" value={user.email ?? "—"} verified={user.email_verified} />
          </div>
          <div>
            <Button
              size="sm"
              onClick={() => {
                updateUser({ name: name.trim() || "Guest" });
                setSavedMsg("Profile saved.");
              }}
            >
              Save changes
            </Button>
            {savedMsg && <span className="ml-3 text-xs text-success">{savedMsg}</span>}
          </div>
        </CardBody>
      </Card>

      {/* Addresses */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Delivery addresses</p>
            <Button size="sm" variant="outline" onClick={() => alert("Demo — address book not wired.")}>
              Add address
            </Button>
          </div>
          {subscription ? (
            <p className="mt-2 text-sm text-muted">
              Your active plan delivers to the address saved at checkout. Update it from the dashboard home.
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted">No saved addresses yet.</p>
          )}
        </CardBody>
      </Card>

      {/* Notifications */}
      <Card>
        <CardBody className="space-y-3">
          <p className="text-sm font-semibold">Notifications</p>
          {[
            { key: "delivery" as const, label: "Delivery updates" },
            { key: "progress" as const, label: "Weekly progress summary" },
            { key: "offers" as const, label: "Offers & promotions" },
          ].map((n) => (
            <label key={n.key} className="flex items-center justify-between">
              <span className="text-sm text-primary">{n.label}</span>
              <input
                type="checkbox"
                checked={notif[n.key]}
                onChange={(e) => setNotif({ ...notif, [n.key]: e.target.checked })}
                className="h-4 w-4"
              />
            </label>
          ))}
        </CardBody>
      </Card>

      {/* Danger zone — account deletion kept visible, not buried */}
      <Card className="border-danger/40">
        <CardBody>
          <p className="text-sm font-semibold text-danger">Delete account</p>
          <p className="mt-1 text-sm text-muted">
            Permanently remove your account and all plan data. This cannot be undone.
          </p>
          {confirmDelete ? (
            <div className="mt-3 flex gap-2">
              <Button variant="danger" size="sm" onClick={deleteAccount}>
                Yes, delete everything
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="mt-3 border-danger text-danger hover:bg-danger/5" onClick={() => setConfirmDelete(true)}>
              Delete my account
            </Button>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function Field({ label, value, verified }: { label: string; value: string; verified: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <div className="flex items-center gap-2">
        <span className="truncate font-medium text-primary">{value}</span>
        {value !== "—" && (
          <Badge variant={verified ? "success" : "surface"} size="sm">
            {verified ? "Verified" : "Unverified"}
          </Badge>
        )}
      </div>
    </div>
  );
}
