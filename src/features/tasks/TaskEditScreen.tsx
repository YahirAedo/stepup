import { useCallback, useEffect } from 'react';
import { type CompositeScreenProps } from '@react-navigation/native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { type BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import { useTaskEdit } from './hooks/useTaskEdit';
import TaskEditView from './views/TaskEditView';
import type { TasksStackParamList, MainTabParamList } from '../../types/navigation';

type Props = CompositeScreenProps<
  NativeStackScreenProps<TasksStackParamList, 'TaskEdit'>,
  BottomTabScreenProps<MainTabParamList>
>;

export default function TaskEditScreen({ navigation, route }: Props) {
  const { taskId } = route.params;
  const {
    task,
    loadError,
    saveError,
    deleteOpen,
    stepSheet,
    stepSheetError,
    ordenarVisible,
    discardOpen,
    hasUnsaved,
    isLongTitle,
    canOrder,
    title,
    notes,
    notesOpen,
    dueDate,
    steps,
    pendingDeletes,
    skipGuardRef,
    setTitle,
    setNotes,
    setNotesOpen,
    setDueDate,
    setOrdenarVisible,
    setDeleteOpen,
    setDiscardOpen,
    openCreateSheet,
    openEditSheet,
    closeStepSheet,
    saveStepSheet,
    toggleDelete,
    handleOrdenarDone,
    save,
    deleteTask,
    discardChanges,
  } = useTaskEdit(taskId);

  const handleSave = useCallback(async () => {
    const ok = await save();
    if (ok) {
      skipGuardRef.current = true;
      navigation.goBack();
    }
  }, [save, navigation, skipGuardRef]);

  const handleDelete = useCallback(async () => {
    const ok = await deleteTask();
    if (ok) {
      skipGuardRef.current = true;
      navigation.navigate('TaskList');
    }
  }, [deleteTask, navigation, skipGuardRef]);

  const handleDiscard = useCallback(() => {
    discardChanges();
    skipGuardRef.current = true;
    navigation.goBack();
  }, [discardChanges, navigation, skipGuardRef]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (skipGuardRef.current) return;
      if (hasUnsaved) {
        e.preventDefault();
        setDiscardOpen(true);
      }
    });
    return unsubscribe;
  }, [navigation, hasUnsaved, setDiscardOpen, skipGuardRef]);

  if (loadError) {
    return null;
  }

  if (!task) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <TaskEditView
        title={title}
        notes={notes}
        notesOpen={notesOpen}
        dueDate={dueDate}
        steps={steps}
        pendingDeletes={pendingDeletes}
        hasUnsaved={hasUnsaved}
        isLongTitle={isLongTitle}
        canOrder={canOrder}
        stepSheet={stepSheet}
        ordenarVisible={ordenarVisible}
        deleteOpen={deleteOpen}
        discardOpen={discardOpen}
        onTitleChange={setTitle}
        onNotesChange={setNotes}
        onNotesToggle={() => setNotesOpen(!notesOpen)}
        onDueDateChange={setDueDate}
        onOpenEditSheet={openEditSheet}
        onSaveEditStep={saveStepSheet}
        onCloseEditSheet={closeStepSheet}
        onToggleDelete={toggleDelete}
        onOpenCreateSheet={openCreateSheet}
        onOrdenarDone={handleOrdenarDone}
        onOrdenarVisibleChange={setOrdenarVisible}
        onDeleteOpenChange={setDeleteOpen}
        onSave={handleSave}
        onDelete={handleDelete}
        onDiscardConfirm={handleDiscard}
        onDiscardClose={() => setDiscardOpen(false)}
        saveError={saveError}
        stepSheetError={stepSheetError}
      />
    </View>
  );
}