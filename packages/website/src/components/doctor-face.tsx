import getDoctorFace from "@/utils/get-doctor-face";
import getScoreColorClass from "@/utils/get-score-color-class";

const BOX_TOP = "┌─────┐";
const BOX_BOTTOM = "└─────┘";

const DoctorFace = ({ score }: { score: number }) => {
  const [eyes, mouth] = getDoctorFace(score);
  const colorClass = getScoreColorClass(score);

  return (
    <pre className={`${colorClass} leading-tight`}>
      {`  ${BOX_TOP}\n  │ ${eyes} │\n  │ ${mouth} │\n  ${BOX_BOTTOM}`}
    </pre>
  );
};

export default DoctorFace;
