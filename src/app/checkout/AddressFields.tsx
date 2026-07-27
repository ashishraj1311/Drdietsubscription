"use client";

import { useState } from "react";
import { Badge, Button, Chip, Input, Select } from "@/components/ui";
import { api } from "@/lib/mock/api";
import { CITIES } from "@/lib/mock/seed";
import type { AddressData } from "@/lib/types";

export const emptyAddress = (): AddressData => ({
  label: "home",
  city: "",
  area: "",
  pincode: "",
  line1: "",
  serviceable: false,
});

/**
 * One delivery address block. Serviceability (city/area/pincode) sits ABOVE the
 * street field so "do you deliver to my area?" is answered first (journey-map
 * pain point + audited checkout order).
 */
export function AddressFields({
  value,
  onChange,
  heading,
}: {
  value: AddressData;
  onChange: (a: AddressData) => void;
  heading?: string;
}) {
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState<null | boolean>(
    value.serviceable ? true : null,
  );

  const set = (patch: Partial<AddressData>) => onChange({ ...value, ...patch });
  const areas = value.city ? CITIES[value.city]?.areas ?? [] : [];

  async function check() {
    setChecking(true);
    const ok = await api.checkServiceability(value.pincode);
    setChecked(ok);
    set({ serviceable: ok });
    setChecking(false);
  }

  return (
    <div className="space-y-3">
      {heading && (
        <p className="text-sm font-semibold text-primary">{heading}</p>
      )}

      {/* Serviceability FIRST */}
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="City"
          value={value.city}
          onChange={(e) => {
            set({ city: e.target.value, area: "", serviceable: false });
            setChecked(null);
          }}
        >
          <option value="">Select city</option>
          {Object.keys(CITIES).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select
          label="Area"
          value={value.area}
          disabled={!value.city}
          onChange={(e) => set({ area: e.target.value })}
        >
          <option value="">Select area</option>
          {areas.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            label="Pincode"
            inputMode="numeric"
            maxLength={6}
            placeholder="400001"
            value={value.pincode}
            onChange={(e) => {
              set({ pincode: e.target.value.replace(/\D/g, ""), serviceable: false });
              setChecked(null);
            }}
          />
        </div>
        <Button
          variant="outline"
          disabled={value.pincode.length !== 6 || checking}
          onClick={check}
        >
          {checking ? "Checking…" : "Check"}
        </Button>
      </div>

      {checked === true && (
        <Badge variant="success">✓ We deliver to {value.area || "your area"}!</Badge>
      )}
      {checked === false && (
        <Badge variant="danger">
          ✕ Sorry, we don&apos;t deliver to {value.pincode} yet
        </Badge>
      )}

      {/* Street address only after area is known */}
      <Input
        label="Flat / street address"
        placeholder="Flat 4B, Green Residency, Main Road"
        value={value.line1}
        onChange={(e) => set({ line1: e.target.value })}
      />

      <div className="flex flex-wrap gap-2">
        {(["home", "work", "other"] as const).map((l) => (
          <Chip
            key={l}
            selected={value.label === l}
            onClick={() => set({ label: l })}
          >
            {l[0].toUpperCase() + l.slice(1)}
          </Chip>
        ))}
      </div>
    </div>
  );
}
