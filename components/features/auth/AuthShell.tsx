"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutGroup, motion } from "framer-motion";

export default function AuthShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const imageOnRight = ["/auth/sign-in"].includes(pathname);

  return (
    <LayoutGroup>
      <div className="flex overflow-hidden min-h-screen bg-background dark:bg-background">
        {/*==================== Auth Image ====================*/}
        <motion.div
          layoutId="auth__image"
          style={{ order: imageOnRight ? 2 : 1 }}
          className="hidden lg:flex relative p-3 basis-[60%] shrink-0"
          transition={{ type: "spring", stiffness: 100, damping: 12 }}
        >
          <div className="relative w-full h-full rounded-tl-4xl rounded-br-4xl overflow-hidden z-100">
            <Image
              fill
              priority
              className="object-cover"
              alt="Schedli | Auth Image"
              src="/images/app/auth-image.jpg"
            />
          </div>
        </motion.div>
        {/*==================== End of Auth Image ====================*/}

        {/*==================== Form Panel ====================*/}
        <motion.div
          key={pathname}
          animate={{ opacity: 1, x: 0 }}
          style={{ order: imageOnRight ? 1 : 2 }}
          initial={{ opacity: 0, x: imageOnRight ? -24 : 24 }}
          className="flex flex-1 flex-col justify-center px-6 py-12"
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          {children}
        </motion.div>
        {/*==================== End of Form Panel ====================*/}
      </div>
    </LayoutGroup>
  );
}
