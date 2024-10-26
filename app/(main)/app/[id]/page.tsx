import CodeViewer from "@/components/code-viewer";
import client from "@/lib/prisma";
import { notFound } from "next/navigation";
import { cache } from "react";

export default async function Page({ params }: { params: { id: string } }) {
    if (typeof params.id !== "string") {
      return notFound();
    }
  
    const app = await getGeneratedApp(params.id)
  
    if (!app) {
      return notFound()
    }
  
    return <div className="h-screen w-screen"><CodeViewer code={app.code} /></div>;
 }
  
  const getGeneratedApp = cache(async (id: string) => {
    return client.publishedApp.findUnique({
      where: {
        id,
      },
    });
  });