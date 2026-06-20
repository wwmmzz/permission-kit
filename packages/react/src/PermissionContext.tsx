import { createContext } from "react";
import type { PermissionChecker } from "@permission-kit/core";

export const PermissionContext = createContext<PermissionChecker | null>(null);
