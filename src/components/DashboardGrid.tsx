'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDashboardStore, type DashboardState } from '@/store/dashboard-store';
import { WidgetContainer } from './widgets/WidgetContainer';
import { AddWidgetPlaceholder } from './AddWidgetPlaceholder';

function SortableWidget({ id }: { id: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'opacity-50' : ''}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <WidgetContainer widgetId={id} />
      </div>
    </div>
  );
}

export function DashboardGrid() {
  const widgets = useDashboardStore((s: DashboardState) => s.widgets);
  const reorderWidgets = useDashboardStore((s: DashboardState) => s.reorderWidgets);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w: DashboardState['widgets'][number]) => w.config.id === active.id);
      const newIndex = widgets.findIndex((w: DashboardState['widgets'][number]) => w.config.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderWidgets(oldIndex, newIndex);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="grid gap-6 p-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <SortableContext
          items={widgets.map((w: DashboardState['widgets'][number]) => w.config.id)}
          strategy={rectSortingStrategy}
        >
          {widgets.map((widget: DashboardState['widgets'][number]) => (
            <SortableWidget key={widget.config.id} id={widget.config.id} />
          ))}
          <AddWidgetPlaceholder />
        </SortableContext>
      </div>
    </DndContext>
  );
}
