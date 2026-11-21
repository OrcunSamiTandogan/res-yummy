"use client";

import { createContext, useContext, useEffect, useState } from "react";
import seed from "@/data/site.json";
import { cmsEnabled, publicCmsRequest, type RestaurantContent } from "@/lib/yummy-api";

const initial = seed as RestaurantContent;
const RestaurantContext = createContext<RestaurantContent>(initial);

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const [site, setSite] = useState<RestaurantContent>(initial);
  useEffect(() => {
    if (!cmsEnabled) return;
    let active = true;
    void publicCmsRequest<RestaurantContent>("/site-content")
      .then((content) => { if (active) setSite(content); })
      .catch(() => { /* Preserve checked-in contact details during temporary API outage. */ });
    return () => { active = false; };
  }, []);
  return <RestaurantContext.Provider value={site}>{children}</RestaurantContext.Provider>;
}

export function useRestaurant(): RestaurantContent {
  return useContext(RestaurantContext);
}
