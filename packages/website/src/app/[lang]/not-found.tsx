import Link from "next/link";
import { Home, Compass } from "lucide-react";
import { LINK } from "@/constants/links";
import { Button } from "@/components/ui/button";
import { getTranslation } from "@/translations";

const NotFoundPage = () => {
  const translation = getTranslation("en");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center">
      <p className="text-8xl font-black tracking-tight text-fd-foreground sm:text-9xl">
        {translation.notFound.heading}
      </p>
      <p className="max-w-md text-lg text-fd-muted-foreground">
        {translation.notFound.description}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild variant="default" size="lg" className="gap-2">
          <Link href="/">
            <Home className="size-4" />
            {translation.notFound.goHome}
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="gap-2">
          <Link href={LINK.FUMADOCS_NOT_FOUND_DOCS} target="_blank" rel="noopener noreferrer">
            <Compass className="size-4" />
            {translation.notFound.explore}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
