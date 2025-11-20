 // PUBLIC_INTERFACE
 /**
  * computeMindMapData
  * Local mock skill/domain mapping and gap computation to produce a node-link structure for visualization.
  * Inputs:
  *  - currentRole: { id, name }
  *  - targetRole: { id, name }
  * Outputs:
  *  - { nodes: [{ id, label, type }], links: [{ source, target, relation }] }
  * Types: 'role-current', 'role-target', 'domain', 'skill', 'sub-skill', 'gap', 'recommendation'
  *
  * This utility is intentionally modular to be replaced with backend integration later.
  */
 export function computeMindMapData(currentRole, targetRole) {
   const cur = currentRole || { id: 'cur', name: 'Current' };
   const tgt = targetRole || { id: 'tgt', name: 'Target' };

   // Mock role-to-domain-to-skill mappings
   const mockDomains = [
     {
       id: 'dom-arch',
       label: 'Architecture',
       skills: [
         {
           id: 'skill-sysdesign',
           label: 'System Design',
           requiredLevel: 4,
           subskills: [
             { id: 'sub-traffic', label: 'Traffic & Capacity Planning' },
             { id: 'sub-caching', label: 'Caching Strategies' },
             { id: 'sub-datapart', label: 'Data Partitioning' },
           ],
         },
         {
           id: 'skill-api',
           label: 'API Design',
           requiredLevel: 3,
           subskills: [
             { id: 'sub-rest', label: 'REST Principles' },
             { id: 'sub-version', label: 'Versioning & Deprecation' },
           ],
         },
       ],
     },
     {
       id: 'dom-cloud',
       label: 'Cloud',
       skills: [
         {
           id: 'skill-aws',
           label: 'AWS Core',
           requiredLevel: 3,
           subskills: [
             { id: 'sub-iam', label: 'IAM' },
             { id: 'sub-network', label: 'VPC & Networking' },
             { id: 'sub-rds', label: 'Managed DB (RDS)' },
           ],
         },
       ],
     },
     {
       id: 'dom-practices',
       label: 'Engineering Practices',
       skills: [
         {
           id: 'skill-testing',
           label: 'Testing',
           requiredLevel: 3,
           subskills: [
             { id: 'sub-unit', label: 'Unit Tests' },
             { id: 'sub-int', label: 'Integration Tests' },
           ],
         },
       ],
     },
   ];

   // Mock current proficiency map; in a real app, these would come from user profile
   const currentLevels = {
     'skill-sysdesign': 2,
     'skill-api': 3,
     'skill-aws': 1,
     'skill-testing': 3,
   };

   const nodes = [];
   const links = [];

   const addNode = (id, label, type) => {
     if (!nodes.find((n) => n.id === id)) nodes.push({ id, label, type });
   };
   const addLink = (source, target, relation) => {
     links.push({ source, target, relation });
   };

   // Roles
   addNode(`role-current-${cur.id}`, cur.name || 'Current', 'role-current');
   addNode(`role-target-${tgt.id}`, tgt.name || 'Target', 'role-target');
   addLink(`role-current-${cur.id}`, `role-target-${tgt.id}`, 'transition');

   // Domains / skills / subskills / gaps / recs
   mockDomains.forEach((dom) => {
     const domId = dom.id;
     addNode(domId, dom.label, 'domain');
     // Connect domain to target role as branches
     addLink(`role-target-${tgt.id}`, domId, 'domain-of-target');

     dom.skills.forEach((sk) => {
       const skillId = sk.id;
       addNode(skillId, `${sk.label} (req ${sk.requiredLevel})`, 'skill');
       addLink(domId, skillId, 'domain-skill');

       const currentLevel = currentLevels[skillId] || 0;
       const isGap = currentLevel < sk.requiredLevel;
       if (isGap) {
         const gapId = `gap-${skillId}`;
         addNode(gapId, `Gap: ${sk.label} (${currentLevel}/${sk.requiredLevel})`, 'gap');
         addLink(skillId, gapId, 'needs-upskill');

         const recId = `rec-${skillId}`;
         addNode(
           recId,
           `Learn: ${sk.label} (course + project)`,
           'recommendation'
         );
         addLink(gapId, recId, 'recommendation');
       }

       // Subskills as collapsible leaves
       (sk.subskills || []).forEach((ss) => {
         addNode(ss.id, ss.label, 'sub-skill');
         addLink(skillId, ss.id, 'breakdown');
       });
     });
   });

   return { nodes, links };
 }

 // PUBLIC_INTERFACE
 /**
  * toD3Graph
  * Convert nodes/links into D3-friendly structure with category colors and sizes.
  */
 export function toD3Graph({ nodes, links }) {
   return {
     nodes: nodes.map((n) => ({
       id: n.id,
       label: n.label,
       type: n.type,
     })),
     links: links.map((l) => ({
       source: l.source,
       target: l.target,
       relation: l.relation,
     })),
   };
 }
