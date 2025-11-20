 // PUBLIC_INTERFACE
 /**
  * transformRoleToRoadmap
  * Converts a role detail object (with required_skills and optional sub_skills)
  * into a normalized roadmap model with milestones and sub-milestones.
  *
  * Input shape (typical):
  * {
  *   id, name, required_skills: [
  *     {
  *       skill_id, skill_name, level_required,
  *       status?: 'Not Started' | 'In Progress' | 'Completed',
  *       estimated_weeks?: number,
  *       depends_on?: number[] // array of skill_ids
  *       sub_skills?: Array<string | { name: string, estimated_weeks?: number, status?: string }>
  *     }
  *   ]
  * }
  *
  * Output:
  * {
  *   milestones: [
  *     {
  *       id: string,
  *       title: string,
  *       requiredLevel: number,
  *       status: 'Not Started' | 'In Progress' | 'Completed',
  *       estimatedWeeks?: number,
  *       dependsOn: string[], // references milestone ids
  *       subMilestones: [
  *         { id: string, title: string, status: string, estimatedWeeks?: number }
  *       ]
  *     }
  *   ],
  *   dependencies: Array<{ from: string, to: string }>
  * }
  */
 export function transformRoleToRoadmap(roleDetail) {
   const safeArray = (x) => (Array.isArray(x) ? x : []);
   const required = safeArray(roleDetail?.required_skills);
   const milestones = [];
   const idMap = new Map(); // skillId -> milestoneId

   // Build milestones first
   for (const s of required) {
     const skillId = s.skill_id ?? s.id ?? `${Math.random()}`;
     const milestoneId = `m-${skillId}`;
     idMap.set(Number(skillId), milestoneId);

     const subMilestones = safeArray(s.sub_skills).map((ss, idx) => {
       if (typeof ss === 'string') {
         return {
           id: `${milestoneId}-ss-${idx}`,
           title: ss,
           status: s.status || 'Not Started',
           estimatedWeeks: undefined,
         };
       }
       return {
         id: `${milestoneId}-ss-${idx}`,
         title: ss?.name || `Sub-skill ${idx + 1}`,
         status: ss?.status || s.status || 'Not Started',
         estimatedWeeks: Number.isFinite(ss?.estimated_weeks) ? Number(ss.estimated_weeks) : undefined,
       };
     });

     milestones.push({
       id: milestoneId,
       title: s.skill_name || `Skill ${skillId}`,
       requiredLevel: Number.isFinite(s.level_required) ? Number(s.level_required) : Number(s.requiredLevel) || 1,
       status: s.status || 'Not Started',
       estimatedWeeks: Number.isFinite(s.estimated_weeks) ? Number(s.estimated_weeks) : undefined,
       dependsOn: [],
       subMilestones,
     });
   }

   // Resolve dependencies
   const dependencies = [];
   for (const s of required) {
     const fromMilestone = idMap.get(Number(s.skill_id)) || idMap.get(Number(s.id));
     const deps = Array.isArray(s.depends_on) ? s.depends_on : [];
     for (const d of deps) {
       const toMilestone = idMap.get(Number(d));
       if (fromMilestone && toMilestone) {
         // to -> from (must finish 'to' before starting 'from')
         dependencies.push({ from: toMilestone, to: fromMilestone });
         const m = milestones.find((x) => x.id === fromMilestone);
         if (m) m.dependsOn.push(toMilestone);
       }
     }
   }

   return { milestones, dependencies };
 }

 // PUBLIC_INTERFACE
 /**
  * calculateProgress
  * Computes overall progress (0..1) based on milestone statuses.
  * Completed = 1, In Progress = 0.5, Not Started = 0
  */
 export function calculateProgress(roadmapModel) {
   const items = Array.isArray(roadmapModel?.milestones) ? roadmapModel.milestones : [];
   if (items.length === 0) return 0;
   const value = items.reduce((acc, m) => {
     const s = (m.status || '').toLowerCase();
     if (s === 'completed') return acc + 1;
     if (s === 'in progress') return acc + 0.5;
     return acc;
   }, 0);
   return value / items.length;
 }

 // PUBLIC_INTERFACE
 /**
  * coerceStatus
  * Normalize status strings to one of the accepted statuses.
  */
 export function coerceStatus(status) {
   const s = String(status || '').toLowerCase();
   if (s.includes('progress')) return 'In Progress';
   if (s.includes('complete') || s === 'done') return 'Completed';
   return 'Not Started';
 }

 // PUBLIC_INTERFACE
 /**
  * buildMockRoleDetail
  * Provides a role-like object with skills/sub-skills for fallback when backend is unavailable.
  */
 export function buildMockRoleDetail(name = 'Target Role (mock)') {
   return {
     id: 9999,
     name,
     required_skills: [
       {
         skill_id: 201,
         skill_name: 'Architecture: System Design',
         level_required: 4,
         status: 'Not Started',
         estimated_weeks: 3,
         depends_on: [202],
         sub_skills: [
           { name: 'Caching & CDN', estimated_weeks: 1 },
           { name: 'Queueing & Backpressure' },
           { name: 'Data Modeling' },
         ],
       },
       {
         skill_id: 202,
         skill_name: 'Cloud: AWS/GCP/Azure',
         level_required: 3,
         status: 'In Progress',
         estimated_weeks: 2,
         sub_skills: ['IAM Basics', 'Networking (VPC)', 'Managed DB (RDS/CloudSQL)'],
       },
       {
         skill_id: 203,
         skill_name: 'Practices: Testing Strategy',
         level_required: 3,
         status: 'Completed',
         estimated_weeks: 1,
         sub_skills: ['Unit tests', 'Integration tests'],
       },
     ],
   };
 }
