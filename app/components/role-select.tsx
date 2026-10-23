"use client";

import { ROLE_GROUPS, ROLES, roleBlurb, roleGroupLabel, roleLabel, roleMeta } from "../lib/roles";
import { useLanguage } from "./language-provider";

/** One shared picker so every project opens positions from the same catalogue. */
export function RoleSelect({
  id,
  name = "role",
  defaultValue = "",
  onValueChange,
}: {
  id: string;
  name?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}) {
  const { locale, tx } = useLanguage();
  return (
    <select
      id={id}
      name={name}
      defaultValue={defaultValue}
      required
      onChange={(event) => onValueChange?.(event.target.value)}
    >
      <option value="" disabled>{tx("Pilih peran…", "Choose a role…")}</option>
      {ROLE_GROUPS.map((group) => (
        <optgroup key={group} label={roleGroupLabel(group, locale)}>
          {ROLES.filter((role) => roleMeta[role].group === group).map((role) => (
            <option key={role} value={role}>
              {roleLabel(role, "", locale)} — {roleBlurb(role, locale)}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
