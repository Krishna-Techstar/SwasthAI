// Nurse — Tasks
import { useState } from 'react'
import { View, Text, ScrollView, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { doctorTheme as t } from '../../constants/doctorTheme'

const INITIAL_TASKS = [
  { id: '1', task: 'Administer Insulin — Bed A-08',    time: '10:30 AM', priority: 'high',   done: false },
  { id: '2', task: 'BP Check — All Ward A patients',   time: '11:00 AM', priority: 'medium', done: false },
  { id: '3', task: 'Dressing change — Bed A-12',       time: '9:00 AM',  priority: 'low',    done: true },
  { id: '4', task: 'Medication round — Evening',        time: '4:00 PM',  priority: 'high',   done: false },
  { id: '5', task: 'Update vitals chart — Bed A-03',   time: '2:00 PM',  priority: 'medium', done: false },
  { id: '6', task: 'Discharge paperwork — Bed A-20',   time: '12:00 PM', priority: 'low',    done: true },
]

const PC = { high: t.semantic.error, medium: t.semantic.warning, low: t.text.muted }

export default function NurseTasks() {
  const [tasks, setTasks] = useState(INITIAL_TASKS)
  const pending = tasks.filter(t => !t.done)
  const completed = tasks.filter(t => t.done)

  const toggle = (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const TaskRow = ({ task }) => (
    <Pressable onPress={() => toggle(task.id)}>
      <View style={{
        backgroundColor: t.bg.secondary, borderWidth: 1, borderColor: t.border.subtle,
        borderRadius: t.radius.card - 4, padding: 14, marginBottom: 8,
        flexDirection: 'row', alignItems: 'center', gap: 12,
        opacity: task.done ? 0.5 : 1,
      }}>
        <View style={{
          width: 22, height: 22, borderRadius: 6,
          backgroundColor: task.done ? t.brand.teal : t.bg.tertiary,
          borderWidth: task.done ? 0 : 1.5, borderColor: t.border.subtle,
          alignItems: 'center', justifyContent: 'center',
        }}>
          {task.done && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{
            ...t.typography.bodyMed, color: t.text.primary, fontSize: 13,
            textDecorationLine: task.done ? 'line-through' : 'none',
          }}>{task.task}</Text>
          <Text style={{ ...t.typography.caption, color: t.text.muted, marginTop: 2 }}>{task.time}</Text>
        </View>
        {!task.done && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: PC[task.priority] }} />}
      </View>
    </Pressable>
  )

  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 52 }}>
        <Text style={{ ...t.typography.h1, color: t.text.primary, marginBottom: 4 }}>Tasks</Text>
        <Text style={{ ...t.typography.body, color: t.text.secondary, marginBottom: 20 }}>
          {pending.length} pending · {completed.length} completed
        </Text>

        {pending.length > 0 && (
          <>
            <Text style={{ ...t.typography.bodyMed, color: t.text.secondary, marginBottom: 8 }}>Pending</Text>
            {pending.map(task => <TaskRow key={task.id} task={task} />)}
          </>
        )}

        {completed.length > 0 && (
          <>
            <Text style={{ ...t.typography.bodyMed, color: t.text.muted, marginTop: 16, marginBottom: 8 }}>Completed</Text>
            {completed.map(task => <TaskRow key={task.id} task={task} />)}
          </>
        )}
      </ScrollView>
    </View>
  )
}
