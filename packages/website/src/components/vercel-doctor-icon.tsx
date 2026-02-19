import Image from "next/image";

const DEFAULT_ICON_SIZE_PX = 40;

interface VercelDoctorIconProps {
  sizePx?: number;
  className?: string;
  alt?: string;
}

const VercelDoctorIcon = ({
  sizePx = DEFAULT_ICON_SIZE_PX,
  className,
  alt = "Vercel Doctor icon",
}: VercelDoctorIconProps) => (
  <Image
    src="/vercel-doctor-icon.svg"
    width={sizePx}
    height={sizePx}
    alt={alt}
    className={className}
  />
);

export default VercelDoctorIcon;
