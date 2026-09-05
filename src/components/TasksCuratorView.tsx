import React from 'react';
import { ClipboardList, UserCheck, CheckCircle2, Circle, Volume2, Award, Sparkles, BookOpen } from 'lucide-react';

interface TasksCuratorViewProps {
  type: 'tasks' | 'curator';
  onNavigateToMap: () => void;
}

export const TasksCuratorView: React.FC<TasksCuratorViewProps> = ({ type, onNavigateToMap }) => {
  const [completedTasks, setCompletedTasks] = React.useState<string[]>(['task-1']);

  const toggleTask = (id: string) => {
    if (completedTasks.includes(id)) {
      setCompletedTasks(completedTasks.filter((t) => t !== id));
    } else {
      setCompletedTasks([...completedTasks, id]);
    }
  };

  if (type === 'tasks') {
    const tasks = [
      {
        id: 'task-1',
        title: 'Calibrate Central Monogram Marker',
        section: 'GALLERY 00',
        points: '50 PTS',
        description: 'Locate the central basalt datum marker on the floor plan and inspect acoustic focal center.',
      },
      {
        id: 'task-2',
        title: 'Inspect Greek Chariot Inscriptions',
        section: 'SECTOR 01',
        points: '75 PTS',
        description: 'Examine limestone frieze fragments positioned along the northwest diagonal gallery.',
      },
      {
        id: 'task-3',
        title: 'Align Nuremberg Brass Astrolabe',
        section: 'ROTUNDA 01',
        points: '100 PTS',
        description: 'Find brass celestial timekeeping instruments in the southern octagonal dome.',
      },
      {
        id: 'task-4',
        title: 'Decode Rhodian Maritime Decrees',
        section: 'SECTOR 03',
        points: '80 PTS',
        description: 'Search for boustrophedon epigraph stone panels in the southwest vestibule.',
      },
    ];

    return (
      <div className="w-full h-full overflow-y-auto p-4 sm:p-6 space-y-6 pb-28 max-w-3xl mx-auto select-none">
        <div className="border-b border-[#0e0f0f] pb-3 flex items-center justify-between">
          <div>
            <span className="font-mono-custom text-[10px] text-[#c5a059] font-bold tracking-widest uppercase">
              GALLERY 00 PROTOCOL
            </span>
            <h2 className="font-sans-custom text-[22px] sm:text-[26px] font-bold text-[#0e0f0f] tracking-tight uppercase">
              CURATORIAL FIELD TASKS
            </h2>
          </div>
          <div className="bg-[#efeded] border border-[#0e0f0f] px-2.5 py-1 font-mono-custom text-[11px] font-bold text-[#0e0f0f]">
            {completedTasks.length} / {tasks.length} COMPLETE
          </div>
        </div>

        <div className="space-y-3">
          {tasks.map((t) => {
            const isDone = completedTasks.includes(t.id);
            return (
              <div
                key={t.id}
                onClick={() => toggleTask(t.id)}
                className={`border-2 border-[#0e0f0f] p-4 transition-all cursor-pointer flex items-start gap-3.5 ${
                  isDone ? 'bg-[#efeded] opacity-90' : 'bg-[#fbf9f9] hover:bg-[#f5f3f3]'
                }`}
              >
                <button className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-[#c5a059]" />
                  ) : (
                    <Circle className="w-5 h-5 text-[#747878]" />
                  )}
                </button>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono-custom text-[10px] text-[#c5a059] font-bold">
                      {t.section} • {t.points}
                    </span>
                  </div>
                  <h3
                    className={`font-sans-custom text-[15px] sm:text-[16px] font-bold text-[#0e0f0f] ${
                      isDone ? 'line-through text-[#747878]' : ''
                    }`}
                  >
                    {t.title}
                  </h3>
                  <p className="text-[12px] text-[#444748] leading-relaxed">
                    {t.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2">
          <button
            onClick={onNavigateToMap}
            className="w-full py-2.5 bg-[#0e0f0f] text-[#fbf9f9] hover:bg-[#242424] font-mono-custom text-[11px] font-medium tracking-wider uppercase transition-colors cursor-pointer"
          >
            RETURN TO MAP TO EXECUTE TASKS
          </button>
        </div>
      </div>
    );
  }

  // Curator Tab
  return (
    <div className="w-full h-full overflow-y-auto p-4 sm:p-6 space-y-6 pb-28 max-w-3xl mx-auto select-none">
      <div className="border-b border-[#0e0f0f] pb-3">
        <span className="font-mono-custom text-[10px] text-[#c5a059] font-bold tracking-widest uppercase">
          ARCHIVE CONSERVATION
        </span>
        <h2 className="font-sans-custom text-[22px] sm:text-[26px] font-bold text-[#0e0f0f] tracking-tight uppercase">
          HEAD CURATOR DOSSIER
        </h2>
      </div>

      <div className="border-2 border-[#0e0f0f] p-5 sm:p-6 bg-[#fbf9f9] space-y-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-[#0e0f0f] text-[#fbf9f9] flex items-center justify-center font-mono-custom font-bold text-lg border border-[#0e0f0f]">
            01
          </div>
          <div>
            <h3 className="font-sans-custom text-[18px] font-bold text-[#0e0f0f]">
              Dr. Helena Voss
            </h3>
            <p className="font-mono-custom text-[11px] text-[#5e5e5d]">
              Principal Conservator &amp; Antiquities Historian
            </p>
          </div>
        </div>

        <p className="text-[13px] leading-relaxed text-[#1b1c1c] border-t border-[#efeded] pt-3">
          "Gallery 00 was originally consecrated as an astronomical and acoustic chamber in the seventeenth century before being reinforced into the high-security archive depository. The southern octagonal rotunda focuses low-frequency resonances while the northern apse serves as the solar meridian baseline. Every marker represents decades of catalogued heritage."
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="border border-[#0e0f0f] p-3 bg-[#f5f3f3] font-mono-custom text-[11px]">
            <span className="text-[#5e5e5d] block text-[10px]">ACTIVE CLEARANCE</span>
            <span className="font-bold text-[#0e0f0f]">LEVEL 01 / FULL ARCHIVE</span>
          </div>
          <div className="border border-[#0e0f0f] p-3 bg-[#f5f3f3] font-mono-custom text-[11px]">
            <span className="text-[#5e5e5d] block text-[10px]">TOTAL ARTIFACTS MONITORED</span>
            <span className="font-bold text-[#0e0f0f]">103 REGISTERED HOLDINGS</span>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={onNavigateToMap}
          className="w-full py-2.5 bg-[#0e0f0f] text-[#fbf9f9] hover:bg-[#242424] font-mono-custom text-[11px] font-medium tracking-wider uppercase transition-colors cursor-pointer"
        >
          EXPLORE GALLERY MAP
        </button>
      </div>
    </div>
  );
};

