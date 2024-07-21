"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

const UnProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/daily");
    }
  }, [user, loading, router]);

  if (user) {
    return null;
  }

  return <>{children}</>;
};

export default UnProtectedRoute;
