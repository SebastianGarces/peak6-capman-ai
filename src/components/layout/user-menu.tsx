"use client";

import { logout } from "@/actions/auth";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { User, LogOut } from "lucide-react";
import Link from "next/link";

interface UserMenuProps {
  name: string;
  email: string;
}

export function UserMenu({ name, email }: UserMenuProps) {
  return (
    <Dropdown
      trigger={
        <div className="flex items-center gap-2 rounded-full bg-surface border border-surface-border px-3 py-1.5 hover:bg-surface-hover transition-colors">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-muted text-xs font-bold text-primary">
            {name.charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:inline text-sm text-text-muted">{name}</span>
        </div>
      }
    >
      <div className="px-3 py-2 border-b border-surface-border mb-1">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-text-dim">{email}</p>
      </div>
      <Link href="/profile">
        <DropdownItem>
          <User className="h-4 w-4" />
          Profile
        </DropdownItem>
      </Link>
      <form action={logout}>
        <DropdownItem danger>
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownItem>
      </form>
    </Dropdown>
  );
}
