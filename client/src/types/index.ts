export type BeltRank = 'white' | 'blue' | 'purple' | 'brown' | 'black'

export type SessionType = 'class' | 'open_mat' | 'drilling' | 'competition' | 'private'

export type GiType = 'gi' | 'nogi' | 'both'

export type FeelingRating = 1 | 2 | 3 | 4 | 5

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  beltRank: BeltRank
  stripes?: number
  academy?: string
  academyId?: string
  bio?: string
  weight?: number
  createdAt?: string
}

export type GroupType = 'academy' | 'friend' | 'comp_team'

export type EventType = 'open_mat' | 'seminar' | 'competition' | 'social' | 'training'

export interface Academy {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  phone?: string
  website?: string
  instagram?: string
  affiliation?: string
  bannerImage?: string
  dropInPrice?: number
  openMatDays?: string[]
  schedule?: AcademySchedule
  classSchedule?: ClassScheduleEntry[]
}

export interface ClassScheduleEntry {
  day: string
  time: string
  type: string
  gi?: GiType
}

export interface AcademySchedule {
  openMats?: string[]
  classes?: string[]
}

export interface TrainingSession {
  id: string
  userId: string
  user?: User
  type: SessionType
  gi?: GiType
  duration: number
  classTime?: number
  sparringTime?: number
  rollsCount?: number
  feeling?: FeelingRating
  notes?: string
  photo?: string
  academyId?: string
  academyName?: string
  techniques?: string[]
  heartRate?: {
    avg: number
    max: number
    min: number
  }
  wearableData?: WearableData
  createdAt: string
  likes?: number
  liked?: boolean
  comments?: number
}

export type RollResult =
  | 'sub_win'
  | 'sub_loss'
  | 'points_win'
  | 'points_loss'
  | 'draw'
  | 'positional'

export type TechniqueCategory =
  | 'Submission'
  | 'Sweep'
  | 'Pass'
  | 'Takedown'
  | 'Escape'
  | 'Position'

export type PositionName =
  | 'Closed Guard'
  | 'Half Guard'
  | 'Mount'
  | 'Back'
  | 'Side Control'
  | 'Open Guard'
  | 'Butterfly Guard'
  | 'De La Riva'
  | 'X Guard'
  | 'Turtle'
  | 'Standing'
  | 'North South'

export interface WeatherInfo {
  temperature: number
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy'
  humidity: number
}

export interface WearableInfo {
  avgHR: number
  maxHR: number
  calories: number
}

export interface Roll {
  id: string
  sessionId?: string
  roundNumber: number
  partnerId?: string
  partnerName: string
  durationMins: number
  result: RollResult
  submissionType?: string
  notes?: string
}

export interface Technique {
  id: string
  name: string
  category: TechniqueCategory
  position: PositionName
  successes: number
  attempts: number
  notes?: string
  successRate?: number
}

export interface WearableData {
  source: 'apple_watch' | 'garmin' | 'whoop' | 'fitbit' | 'other'
  heartRate?: { avg: number; max: number; min: number }
  calories?: number
  vo2max?: number
}

export interface WeeklyScheduleEntry {
  dayOfWeek: number
  startTime: string
  endTime: string
  type: SessionType
  gi?: GiType
  academyId?: string
  academyName?: string
}

export interface Friendship {
  id: string
  userId: string
  friendId: string
  status: 'pending' | 'accepted' | 'blocked'
  createdAt: string
}

export interface AcademyScheduleEntry {
  id: string
  academyId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  classType: string
  instructor?: string
  notes?: string
}

export interface Group {
  id: string
  name: string
  description?: string
  avatar?: string
  bannerImage?: string
  type: GroupType
  groupType?: GroupType
  isAcademy: boolean
  memberCount: number
  members?: GroupMember[]
  academyId?: string
  inviteCode?: string
  createdAt?: string
  createdByName?: string
  myRole?: string | null
  isMember?: boolean
}

export interface GroupMember {
  id: string
  groupId: string
  userId: string
  user?: User
  role: 'owner' | 'admin' | 'member'
  joinedAt: string
}

export interface GroupEvent {
  id: string
  groupId: string
  title: string
  description?: string
  type: EventType
  startTime: string
  endTime?: string
  location?: string
  rsvps?: GroupEventRsvp[]
  goingCount?: number
  maybeCount?: number
  createdBy: string
}

export interface GroupEventRsvp {
  id: string
  eventId: string
  userId: string
  user?: User
  status: 'going' | 'maybe' | 'not_going'
}

export interface GroupPost {
  id: string
  groupId: string
  userId: string
  user?: User
  content: string
  image?: string
  createdAt: string
  likes?: number
  comments?: number
}

export interface Like {
  id: string
  userId: string
  targetType: 'session' | 'post' | 'comment'
  targetId: string
  createdAt: string
}

export interface Comment {
  id: string
  userId: string
  user?: User
  targetType: 'session' | 'post'
  targetId: string
  content: string
  createdAt: string
}

export interface FeedItem {
  id: string
  type: 'session' | 'post' | 'achievement' | 'milestone'
  data: TrainingSession | GroupPost
  createdAt: string
}

export interface UserStats {
  totalSessions: number
  totalDuration: number
  totalRolls: number
  sessionsThisWeek: number
  currentStreak: number
  longestStreak: number
  avgSessionDuration: number
  favoriteTechniques: { name: string; count: number }[]
  beltProgress: number
  monthlyBreakdown: { month: string; sessions: number; duration: number }[]
  weekDays: boolean[] // Mon-Sun, true if trained that day
}

export type CompetitionResult = 'gold' | 'silver' | 'bronze' | 'did_not_place'
export type CompetitionDivision = 'gi' | 'nogi'

export interface Competition {
  id: string
  userId: string
  tournamentName: string
  date: string
  result: CompetitionResult
  weightClass?: string
  division: CompetitionDivision
  notes?: string
  createdAt: string
}

export interface Achievement {
  id: string
  type: 'training' | 'competition' | 'streak'
  icon: string
  title: string
  description: string
  earned: boolean
  progress: number
}

export interface AchievementsData {
  milestones: Achievement[]
  competitionRecord: {
    total: number
    wins: number
    losses: number
    podiums: number
  }
  beltProgression: {
    currentBelt: BeltRank
    stripes: number
    startedAt: string
  }
  currentStreak: number
  longestStreak: number
  totalSessions: number
  totalHours: number
  sparringHours: number
}

export interface ScheduleEntry {
  id: string
  dayOfWeek: number // 0=Mon .. 6=Sun
  time: string
  type: SessionType
  giType: GiType
  academy?: Academy
}

export interface TimerData {
  totalSecs: number
  classSecs: number
  sparringSecs: number
  drillingSecs: number
}
