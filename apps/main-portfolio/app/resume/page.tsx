import { PDF } from '@/components/ui/PDF';

export default function ResumePage() {
  return (
    <div className="w-full h-screen">
      <div className="w-full h-full">
        <PDF
          src="/assets/resume/David_Holcer.pdf"
          width="100%"
          height="100%"
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
