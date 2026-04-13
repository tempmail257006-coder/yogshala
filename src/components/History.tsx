import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Calendar, Clock, Flame, ChevronRight, Activity } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { WorkoutHistory } from '../types';
import PermissionWarning from './PermissionWarning';

const History: React.FC = () => {
  const { user, isDemoMode, permissionError } = useAuth();
  const [history, setHistory] = useState<WorkoutHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (isDemoMode || !user || !db) {
        setHistory([
          { 
            id: '1', title: 'Morning Flow', date: 'Today, 08:30 AM', duration: '20m', calories: '120 kcal', type: 'Flexibility', timestamp: Date.now(),
            poses: [
              { poseId: 'tadasana', name: 'Mountain Pose', duration: 30 },
              { poseId: 'vrikshasana', name: 'Tree Pose', duration: 45 },
              { poseId: 'adho_mukha_svanasana', name: 'Downward-Facing Dog', duration: 60 }
            ]
          },
          { id: '2', title: 'Stress Relief', date: 'Yesterday, 06:15 PM', duration: '15m', calories: '85 kcal', type: 'Meditation', timestamp: Date.now() - 86400000 },
          { id: '3', title: 'Power YOGSHALA', date: 'Mar 5, 07:00 AM', duration: '45m', calories: '310 kcal', type: 'Strength', timestamp: Date.now() - 172800000 },
          { id: '4', title: 'Bedtime Stretch', date: 'Mar 4, 10:30 PM', duration: '10m', calories: '45 kcal', type: 'Relaxation', timestamp: Date.now() - 259200000 },
        ] as any);
        setLoading(false);
        return;
      }

      try {
        const q = query(collection(db, 'history'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        const sortedDocs = docs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setHistory(sortedDocs);
      } catch (error: any) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, isDemoMode]);

  const { totalTime, totalCalories, avgCalories, totalSessions } = useMemo(() => {
    let totalMins = 0;
    let totalCals = 0;

    history.forEach((item) => {
      const durStr = String(item.duration || '0');
      const mMatch = durStr.match(/(\d+)m/);
      const sMatch = durStr.match(/(\d+)s/);
      let m = mMatch ? parseInt(mMatch[1], 10) : 0;
      let s = sMatch ? parseInt(sMatch[1], 10) : 0;
      
      if (!mMatch && !sMatch) {
        m = parseInt(durStr, 10) || 0;
      }

      totalMins += m + s / 60;

      const calStr = String(item.calories || '0');
      const cMatch = calStr.match(/(\d+)/);
      if (cMatch) totalCals += parseInt(cMatch[1], 10);
    });

    const displayTime = totalMins >= 60 ? `${(totalMins / 60).toFixed(1)}h` : `${Math.round(totalMins)}m`;
    const displayCals = Math.round(totalCals);
    const avgCals = history.length > 0 ? Math.round(totalCals / history.length) : 0;

    return { totalTime: displayTime, totalCalories: displayCals, avgCalories: avgCals, totalSessions: history.length };
  }, [history]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-deep-purple border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="page-shell space-y-8">
      {permissionError && <PermissionWarning />}
      
      <header className="space-y-1">
        <h1 className="text-large-title text-gray-900">Practice History</h1>
        <p className="text-body text-gray-500">Your journey to mindfulness</p>
      </header>

      {/* Summary Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 shadow-xl border-white/60"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Activity size={20} className="text-deep-purple" />
          <h3 className="text-section-title text-gray-900">Monthly Summary</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/50 p-4 rounded-2xl border border-white/40">
            <span className="text-small-label text-gray-500 block mb-1">Sessions</span>
            <span className="text-2xl font-bold text-gray-900">{totalSessions}</span>
          </div>
          <div className="bg-white/50 p-4 rounded-2xl border border-white/40">
            <span className="text-small-label text-gray-500 block mb-1">Total Time</span>
            <span className="text-2xl font-bold text-gray-900">{totalTime}</span>
          </div>
          <div className="bg-white/50 p-4 rounded-2xl border border-white/40">
            <span className="text-small-label text-gray-500 block mb-1">Total Energy</span>
            <span className="text-2xl font-bold text-gray-900">{totalCalories} kcal</span>
          </div>
          <div className="bg-white/50 p-4 rounded-2xl border border-white/40">
            <span className="text-small-label text-gray-500 block mb-1">Avg. Energy</span>
            <span className="text-2xl font-bold text-gray-900">{avgCalories} kcal</span>
          </div>
        </div>
      </motion.section>

      {/* History List */}
      {history.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="glass-card p-10 flex flex-col items-center justify-center text-center space-y-4 border-white/40 shadow-sm"
        >
          <div className="w-16 h-16 rounded-full bg-deep-purple/10 text-deep-purple flex items-center justify-center">
            <Calendar size={32} />
          </div>
          <div>
            <h3 className="text-section-title text-gray-900">No practice history yet</h3>
            <p className="text-body text-gray-500 mt-2">Your completed YOGSHALA sessions will appear here.</p>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {history.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
            className="glass-card p-5 flex flex-col shadow-sm hover:shadow-lg transition-all cursor-pointer border-white/40"
          >
              <div className="flex items-center justify-between w-full gap-3">
              <div className="flex items-center space-x-4 min-w-0">
                <div className="w-12 h-12 glass-card flex items-center justify-center text-deep-purple shadow-sm">
                  <Calendar size={24} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-section-title text-gray-900 break-words">{item.title}</h3>
                  <p className="text-small-label text-gray-500 break-words">{item.date}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex flex-col items-end space-y-1">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-ocean-blue">
                    <Clock size={14} />
                    <span>{item.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-warm-orange">
                    <Flame size={14} />
                    <span>{item.calories}</span>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: expandedId === item.id ? 90 : 0 }}
                  className="text-gray-300"
                >
                  <ChevronRight size={20} />
                </motion.div>
              </div>
            </div>

            <AnimatePresence>
              {expandedId === item.id && item.poses && item.poses.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-5 pt-5 border-t border-gray-100 space-y-3">
                    <p className="text-small-label text-gray-400 uppercase tracking-widest">Poses Completed</p>
                    <div className="grid grid-cols-1 gap-2">
                      {item.poses.map((pose, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 border border-gray-100"
                        >
                          <span className="text-body text-gray-700">{pose.name}</span>
                          <span className="text-xs font-mono text-deep-purple font-bold">{pose.duration}s</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
        </div>
      )}
    </div>
  );
};

export default History;
