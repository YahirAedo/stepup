import { useCallback, useEffect } from 'react';
import { type CompositeScreenProps } from '@react-navigation/native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { type BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import { useTaskCreate } from './hooks/useTaskCreate';
import TaskCreateView from './views/TaskCreateView';
import type { TasksStackParamList, MainTabParamList } from '../../types/navigation';

type Props = CompositeScreenProps<
  NativeStackScreenProps<TasksStackParamList, 'TaskCreate'>,
  BottomTabScreenProps<MainTabParamList>
>;

export default function TaskCreateScreen({ navigation }: Props) {
  const {
    title,
    notes,
    notesOpen,
    dueDate,
    steps,
    stepSheet,
    stepSheetError,
    ordenarVisible,
    discardOpen,
    hasUnsaved,
    isLongTitle,
    canOrder,
    canSave,
    canSaveAndStart,
    isSaving,
    saveError,
    skipGuardRef,
    setTitle,
    setNotes,
    setNotesOpen,
    setDueDate,
    setOrdenarVisible,
    setDiscardOpen,
    openCreateSheet,
    openEditSheet,
    closeStepSheet,
    saveStepSheet,
    removeStep,
    handleOrdenarDone,
    save,
    aiStatus,
    aiSuggestions,
    aiMessage,
    suggestSteps,
    acceptAiSteps,
    discardAiSteps,
  } = useTaskCreate();

  const handleSave = useCallback(async () => {
    const created = await save();
    if (created) {
      skipGuardRef.current = true;
      navigation.goBack();
    }
  }, [save, navigation, skipGuardRef]);

  const handleSaveAndStart = useCallback(async () => {
    const created = await save();
    if (created) {
      skipGuardRef.current = true;
      navigation.popToTop();
      navigation.navigate('Focus', { screen: 'FocusMain', params: { taskId: created.id }, initial: false });
    }
  }, [save, navigation, skipGuardRef]);

  const handleDiscard = useCallback(() => {
    skipGuardRef.current = true;
    navigation.goBack();
  }, [navigation, skipGuardRef]);

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

  return (
    <View style={{ flex: 1 }}>
      <TaskCreateView
        title={title}
        notes={notes}
        notesOpen={notesOpen}
        dueDate={dueDate}
        steps={steps}
        stepSheet={stepSheet}
        stepSheetError={stepSheetError}
        ordenarVisible={ordenarVisible}
        discardOpen={discardOpen}
        hasUnsaved={hasUnsaved}
        isLongTitle={isLongTitle}
        canOrder={canOrder}
        canSave={canSave}
        canSaveAndStart={canSaveAndStart}
        isSaving={isSaving}
        saveError={saveError}
        onTitleChange={setTitle}
        onNotesChange={setNotes}
        onNotesToggle={() => setNotesOpen(!notesOpen)}
        onDueDateChange={setDueDate}
        onOpenCreateSheet={openCreateSheet}
        onOpenEditSheet={openEditSheet}
        onSaveEditStep={saveStepSheet}
        onCloseEditSheet={closeStepSheet}
        onRemoveStep={removeStep}
        onOrdenarDone={handleOrdenarDone}
        onOrdenarVisibleChange={setOrdenarVisible}
        onSave={handleSave}
        onSaveAndStart={handleSaveAndStart}
        onDiscardConfirm={handleDiscard}
        onDiscardClose={() => setDiscardOpen(false)}
        aiStatus={aiStatus}
        aiSuggestions={aiSuggestions}
        aiMessage={aiMessage}
        onSuggestSteps={suggestSteps}
        onAcceptAiSteps={acceptAiSteps}
        onDiscardAiSteps={discardAiSteps}
      />
    </View>
  );
}
