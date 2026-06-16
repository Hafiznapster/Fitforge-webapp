import React, { useState } from 'react';
import { useUserStore } from '../store/userStore';
import { EXERCISE_DATABASE } from '../data/exerciseDatabase';
import type { SkillTreePath, HunterRank, ExerciseDefinition } from '../data/exerciseDatabase';
import { canUnlock } from '../services/skillUnlockService';
import { Lock, Unlock, Zap, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PATHS: SkillTreePath[] = ['Push', 'Pull', 'Core', 'Legs'];
const TIERS: HunterRank[] = ['S', 'A', 'B', 'C', 'D', 'E']; // Top to bottom

const SkillTree: React.FC = () => {
  const userStore = useUserStore();
  const [selectedNode, setSelectedNode] = useState<ExerciseDefinition | null>(null);

  const stateForUnlocks = {
    stats: userStore.stats,
    unlockedSkills: userStore.unlockedSkills,
    skillTreeProgress: userStore.skillTreeProgress
  };

  const handleUnlock = (exerciseId: string) => {
    userStore.unlockSkill(exerciseId);
    setSelectedNode(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 h-screen flex flex-col">
      <div className="header-badge mt-6 mb-2">CALISTHENICS</div>
      <h1 className="text-3xl font-bold text-white tracking-[4px] uppercase font-rajdhani mb-2">
        SKILL TREE
      </h1>
      <p className="text-sl-text-dim font-share text-sm mb-6 tracking-widest">
        UNLOCKED: <span className="text-sl-teal">{userStore.unlockedSkills.length}</span> / {EXERCISE_DATABASE.filter(e => e.skillTreePath).length}
      </p>

      <div className="flex-1 overflow-x-auto border border-sl-border bg-sl-surface p-4 relative shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <div className="min-w-[800px] h-full flex justify-between gap-4">
          {PATHS.map(path => (
            <div key={path} className="flex-1 flex flex-col border-r border-sl-border/30 last:border-0 pr-4 last:pr-0">
              <h2 className="text-center font-rajdhani font-bold text-sl-blue tracking-[4px] mb-4 text-xl bg-sl-bg py-2 border border-sl-blue/30">{path}</h2>
              <div className="flex-1 flex flex-col justify-between space-y-4">
                {TIERS.map(tier => {
                  const exercisesInTier = EXERCISE_DATABASE.filter(ex => ex.skillTreePath === path && ex.skillTreeTier === tier);
                  return (
                    <div key={tier} className="flex flex-col items-center justify-center min-h-[60px] relative">
                      {exercisesInTier.map(ex => {
                        const isUnlocked = userStore.unlockedSkills.includes(ex.id);
                        const isUnlockable = !isUnlocked && canUnlock(ex.id, stateForUnlocks);
                        
                        return (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            key={ex.id}
                            onClick={() => setSelectedNode(ex)}
                            className={`w-full py-2 px-1 text-center font-share text-[10px] sm:text-xs tracking-wider border relative transition-all duration-300 ${
                              isUnlocked ? 'bg-sl-blue/20 border-sl-blue text-white shadow-[0_0_15px_rgba(74,158,255,0.4)]' :
                              isUnlockable ? 'bg-sl-teal/10 border-sl-teal text-sl-teal shadow-[0_0_15px_rgba(0,255,163,0.3)] animate-pulse' :
                              'bg-sl-bg border-sl-border-strong text-sl-text-dim opacity-70'
                            }`}
                          >
                            <div className="flex flex-col items-center gap-1">
                              {isUnlocked ? <Unlock size={12} className="text-sl-blue" /> : 
                               isUnlockable ? <Zap size={12} className="text-sl-teal" /> : 
                               <Lock size={12} className="text-sl-text-dim" />}
                              <span className="truncate w-full px-1">{ex.name}</span>
                            </div>
                            {/* Tier Badge */}
                            <span className="absolute -top-2 -right-2 w-4 h-4 bg-sl-bg border border-sl-border text-[8px] flex items-center justify-center font-bold">
                              {tier}
                            </span>
                          </motion.button>
                        );
                      })}
                      {exercisesInTier.length === 0 && <div className="text-transparent">Placeholder</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedNode && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setSelectedNode(null)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-sl-surface border-l border-sl-border z-50 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.8)]">
              <div className="p-4 border-b border-sl-border flex justify-between items-center bg-sl-bg">
                <div className="header-badge">{selectedNode.skillTreeTier}-RANK SKILL</div>
                <button onClick={() => setSelectedNode(null)} className="text-sl-text-dim hover:text-white"><X size={20}/></button>
              </div>
              <div className="p-6 flex-1 overflow-y-auto">
                <h2 className="text-2xl font-rajdhani font-bold text-white tracking-[2px] mb-1">{selectedNode.name}</h2>
                <p className="font-share text-sl-blue tracking-widest text-xs mb-8">{selectedNode.skillTreePath} PATH</p>

                {/* Requirements */}
                <h3 className="font-share text-sl-text-dim tracking-widest text-[10px] mb-3">REQUIREMENTS</h3>
                <div className="bg-sl-bg border border-sl-border p-4 mb-6 space-y-3">
                  {selectedNode.unlockRequirements?.minSTR && (
                    <div className="flex justify-between font-share text-xs">
                      <span className="text-sl-text-dim">MINIMUM STR</span>
                      <span className={userStore.stats.STR >= selectedNode.unlockRequirements.minSTR ? 'text-sl-teal' : 'text-red-400'}>
                        {userStore.stats.STR} / {selectedNode.unlockRequirements.minSTR}
                      </span>
                    </div>
                  )}
                  {selectedNode.unlockRequirements?.minAGI && (
                    <div className="flex justify-between font-share text-xs">
                      <span className="text-sl-text-dim">MINIMUM AGI</span>
                      <span className={userStore.stats.AGI >= selectedNode.unlockRequirements.minAGI ? 'text-sl-teal' : 'text-red-400'}>
                        {userStore.stats.AGI} / {selectedNode.unlockRequirements.minAGI}
                      </span>
                    </div>
                  )}
                  {selectedNode.prerequisites?.map(prereqId => {
                    const prereq = EXERCISE_DATABASE.find(e => e.id === prereqId);
                    const hasPrereq = userStore.unlockedSkills.includes(prereqId);
                    return (
                      <div key={prereqId} className="flex justify-between font-share text-xs">
                        <span className="text-sl-text-dim">SKILL: {prereq?.name}</span>
                        <span className={hasPrereq ? 'text-sl-teal' : 'text-red-400'}>{hasPrereq ? 'UNLOCKED' : 'LOCKED'}</span>
                      </div>
                    )
                  })}
                  {selectedNode.unlockRequirements?.completionQuest && (
                    <div className="flex justify-between font-share text-xs border-t border-sl-border/50 pt-2 mt-2">
                      <span className="text-sl-text-dim">
                        QUEST: {EXERCISE_DATABASE.find(e => e.id === selectedNode.unlockRequirements!.completionQuest!.exerciseId)?.name} 
                        {selectedNode.unlockRequirements.completionQuest.reps && ` x${selectedNode.unlockRequirements.completionQuest.reps}`}
                        {selectedNode.unlockRequirements.completionQuest.durationSeconds && ` for ${selectedNode.unlockRequirements.completionQuest.durationSeconds}s`}
                      </span>
                      <span className="text-sl-blue flex items-center">
                        IN PROGRESS <ChevronRight size={12} className="ml-1"/>
                      </span>
                    </div>
                  )}
                  {(!selectedNode.unlockRequirements && (!selectedNode.prerequisites || selectedNode.prerequisites.length === 0)) && (
                    <div className="text-sl-teal font-share text-xs">NO REQUIREMENTS (BASIC SKILL)</div>
                  )}
                </div>

                {/* Status */}
                {userStore.unlockedSkills.includes(selectedNode.id) ? (
                  <div className="text-center p-4 bg-sl-blue/10 border border-sl-blue/30 text-sl-blue font-rajdhani tracking-[4px] font-bold">
                    SKILL UNLOCKED
                  </div>
                ) : canUnlock(selectedNode.id, stateForUnlocks) ? (
                  <button onClick={() => handleUnlock(selectedNode.id)}
                    className="w-full text-center p-4 bg-sl-teal/20 border border-sl-teal text-sl-teal hover:bg-sl-teal hover:text-sl-bg font-rajdhani tracking-[4px] font-bold transition-colors shadow-[0_0_20px_rgba(0,255,163,0.3)]">
                    AWAKEN SKILL
                  </button>
                ) : (
                  <div className="text-center p-4 bg-sl-bg border border-sl-border-strong text-sl-text-dim font-rajdhani tracking-[4px] font-bold">
                    LOCKED
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SkillTree;
