import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Clock, Calendar } from 'lucide-react';

interface DaySchedule {
  day: string;
  dayName: string;
  startTime: string;
  endTime: string;
}

interface MultiDayScheduleProps {
  value: DaySchedule[];
  onChange: (schedules: DaySchedule[]) => void;
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Segunda-feira' },
  { value: 'tuesday', label: 'Terça-feira' },
  { value: 'wednesday', label: 'Quarta-feira' },
  { value: 'thursday', label: 'Quinta-feira' },
  { value: 'friday', label: 'Sexta-feira' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' },
];

export function MultiDaySchedule({ value = [], onChange }: MultiDayScheduleProps) {
  const [selectedDay, setSelectedDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const addDaySchedule = () => {
    if (!selectedDay || !startTime || !endTime) return;

    const dayInfo = DAYS_OF_WEEK.find(d => d.value === selectedDay);
    if (!dayInfo) return;

    // Verifica se o dia já foi adicionado
    const existingDayIndex = value.findIndex(schedule => schedule.day === selectedDay);
    
    const newSchedule: DaySchedule = {
      day: selectedDay,
      dayName: dayInfo.label,
      startTime,
      endTime,
    };

    let updatedSchedules;
    if (existingDayIndex >= 0) {
      // Atualiza horário existente
      updatedSchedules = [...value];
      updatedSchedules[existingDayIndex] = newSchedule;
    } else {
      // Adiciona novo dia
      updatedSchedules = [...value, newSchedule];
    }

    // Ordena os dias da semana na ordem correta
    updatedSchedules.sort((a, b) => {
      const orderA = DAYS_OF_WEEK.findIndex(d => d.value === a.day);
      const orderB = DAYS_OF_WEEK.findIndex(d => d.value === b.day);
      return orderA - orderB;
    });

    onChange(updatedSchedules);
    
    // Reset form
    setSelectedDay('');
    setStartTime('');
    setEndTime('');
  };

  const removeDaySchedule = (dayToRemove: string) => {
    const updatedSchedules = value.filter(schedule => schedule.day !== dayToRemove);
    onChange(updatedSchedules);
  };

  const formatTimeRange = (start: string, end: string) => {
    return `${start} às ${end}`;
  };

  // Dias disponíveis para seleção (não incluídos ainda)
  const availableDays = DAYS_OF_WEEK.filter(day => 
    !value.some(schedule => schedule.day === day.value)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Horários por Dia</h3>
      </div>

      {/* Lista de dias já adicionados */}
      {value.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Dias selecionados:</Label>
          <div className="space-y-2">
            {value.map((schedule) => (
              <Card key={schedule.day} className="border-l-4 border-l-blue-500">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="font-medium">
                        {schedule.dayName}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        {formatTimeRange(schedule.startTime, schedule.endTime)}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDaySchedule(schedule.day)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Formulário para adicionar novo dia */}
      <Card className="border-dashed border-2 border-gray-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Adicionar Dia e Horário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="day-select">Dia da Semana</Label>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o dia" />
                </SelectTrigger>
                <SelectContent>
                  {availableDays.length > 0 ? (
                    availableDays.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500">
                      Todos os dias já foram adicionados
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="start-time">Horário de Início</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="08:00"
              />
            </div>

            <div>
              <Label htmlFor="end-time">Horário de Fim</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="17:00"
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={addDaySchedule}
            disabled={!selectedDay || !startTime || !endTime || availableDays.length === 0}
            className="w-full"
            variant={value.find(s => s.day === selectedDay) ? "outline" : "default"}
          >
            <Plus className="w-4 h-4 mr-2" />
            {value.find(s => s.day === selectedDay) ? 'Atualizar Horário' : 'Adicionar Dia'}
          </Button>

          {value.length === 0 && (
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Dica:</strong> Adicione os dias e horários que o freelancer precisará trabalhar.
                Você pode definir horários diferentes para cada dia da semana.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo */}
      {value.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Resumo da Agenda ({value.length} {value.length === 1 ? 'dia' : 'dias'})
              </span>
            </div>
            <p className="text-sm text-green-700">
              O freelancer precisará estar disponível nos horários definidos para cada dia selecionado.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}