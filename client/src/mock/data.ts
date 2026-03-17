import { User, TrainingSession, Academy, Group } from '../types'

export const currentUser: User = {
  id: '1',
  name: 'You',
  email: 'you@rolltrack.app',
  avatar: undefined,
  beltRank: 'blue',
  academy: 'Gracie Barra Downtown',
  bio: 'Training since 2022. Always looking to roll.',
}

export const mockUsers: User[] = [
  currentUser,
  { id: '2', name: 'Marcus Silva', email: 'marcus@example.com', beltRank: 'purple', academy: 'Gracie Barra Downtown' },
  { id: '3', name: 'Sarah Chen', email: 'sarah@example.com', beltRank: 'blue', academy: 'Alliance HQ' },
  { id: '4', name: 'Jake Torres', email: 'jake@example.com', beltRank: 'brown', academy: '10th Planet' },
  { id: '5', name: 'Ana Rodrigues', email: 'ana@example.com', beltRank: 'white', academy: 'Gracie Barra Downtown' },
  { id: '6', name: 'Tommy Nguyen', email: 'tommy@example.com', beltRank: 'black', academy: 'Atos HQ' },
]

export const mockSessions: TrainingSession[] = [
  {
    id: 's1',
    userId: '2',
    user: mockUsers[1],
    type: 'class',
    duration: 5400,
    classTime: 3600,
    sparringTime: 1800,
    notes: 'Worked on guard retention and back takes. Had some great rolls with the competition team.',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    likes: 12,
    comments: 3,
  },
  {
    id: 's2',
    userId: '3',
    user: mockUsers[2],
    type: 'open_mat',
    duration: 3600,
    sparringTime: 3600,
    notes: 'Open mat at Alliance. Focused on passing half guard. Got caught in a few triangles.',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    likes: 8,
    comments: 1,
  },
  {
    id: 's3',
    userId: '4',
    user: mockUsers[3],
    type: 'class',
    duration: 7200,
    classTime: 4500,
    sparringTime: 2700,
    notes: 'Competition prep class. Drilled wrestling takedowns and pressure passing. Feeling ready for the tournament.',
    heartRate: { avg: 145, max: 182, min: 88 },
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    likes: 23,
    comments: 7,
  },
  {
    id: 's4',
    userId: '5',
    user: mockUsers[4],
    type: 'class',
    duration: 3600,
    classTime: 2700,
    sparringTime: 900,
    notes: 'First week of training! Learned shrimping and basic closed guard.',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    likes: 31,
    comments: 12,
  },
  {
    id: 's5',
    userId: '6',
    user: mockUsers[5],
    type: 'drilling',
    duration: 2700,
    notes: 'Solo drilling session. Movement flows, guard retention drills, and stretching.',
    heartRate: { avg: 128, max: 155, min: 72 },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    likes: 15,
    comments: 4,
  },
]

export const mockAcademies: Academy[] = [
  {
    id: 'a1',
    name: 'Gracie Barra Downtown',
    address: '123 Main St',
    lat: 40.7128,
    lng: -74.006,
    phone: '555-0100',
    schedule: { classes: ['Mon/Wed/Fri 6pm', 'Tue/Thu 7am'], openMats: ['Sat 10am', 'Sun 11am'] },
  },
  {
    id: 'a2',
    name: 'Alliance HQ',
    address: '456 Oak Ave',
    lat: 40.7189,
    lng: -73.9985,
    phone: '555-0200',
    schedule: { classes: ['Mon-Fri 6pm', 'Mon-Fri 12pm'], openMats: ['Sat 9am'] },
  },
  {
    id: 'a3',
    name: '10th Planet',
    address: '789 Elm St',
    lat: 40.7282,
    lng: -73.9942,
    phone: '555-0300',
    schedule: { classes: ['Mon/Wed/Fri 7pm', 'Tue/Thu 6pm'], openMats: ['Sun 12pm'] },
  },
  {
    id: 'a4',
    name: 'Atos HQ',
    address: '321 Pine Rd',
    lat: 40.7052,
    lng: -74.0132,
    phone: '555-0400',
    schedule: { classes: ['Mon-Sat 6am', 'Mon-Fri 5:30pm'], openMats: ['Sat 11am', 'Sun 10am'] },
  },
  {
    id: 'a5',
    name: 'Renzo Gracie Academy',
    address: '555 Broadway',
    lat: 40.7225,
    lng: -74.0019,
    schedule: { classes: ['Mon-Fri 12pm & 6pm'], openMats: ['Sat/Sun 10am'] },
  },
]

export const mockGroups: Group[] = [
  { id: 'g1', name: 'Gracie Barra Downtown', description: 'Official academy group', type: 'academy', isAcademy: true, memberCount: 87 },
  { id: 'g2', name: 'Comp Team NYC', description: 'NYC competition training crew', type: 'comp_team', isAcademy: false, memberCount: 12 },
  { id: 'g3', name: 'Morning Grinders', description: 'Early morning open mat crew. 6am sharp.', type: 'friend', isAcademy: false, memberCount: 8 },
  { id: 'g4', name: 'Leg Lock Study Group', description: 'Breaking down leg lock systems and entries', type: 'friend', isAcademy: false, memberCount: 23 },
]

// User's own training history for profile page
export const myRecentSessions: TrainingSession[] = [
  {
    id: 'ms1', userId: '1', type: 'class', duration: 5400, classTime: 3600, sparringTime: 1800,
    notes: 'Focused on de la riva guard. Hit a nice sweep in sparring.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ms2', userId: '1', type: 'open_mat', duration: 3600, sparringTime: 3600,
    notes: 'Saturday open mat. Got some great rounds in.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ms3', userId: '1', type: 'class', duration: 5400, classTime: 3600, sparringTime: 1800,
    notes: 'Kimura trap system from half guard.',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ms4', userId: '1', type: 'class', duration: 5400, classTime: 4200, sparringTime: 1200,
    notes: 'No-gi night. Guillotines and darces.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ms5', userId: '1', type: 'drilling', duration: 1800,
    notes: 'Mobility work and solo drills.',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
]
