# Patient Appointment Scheduling Feature

## Overview

This document describes the Patient Appointment Scheduling feature implemented for the SmileCare Dental Clinic web application. The feature provides a complete appointment management system for patients to book, view, cancel, and reschedule dental appointments.

## Features Implemented

### 1. Book Appointment
- **Doctor Selection**: Patients can choose from available doctors with their specialties
- **Date Selection**: Interactive calendar for selecting appointment dates
- **Time Slot Selection**: Available time slots based on doctor's working hours and existing bookings
- **Form Validation**: Comprehensive validation using Zod schema
- **Confirmation**: Success page with appointment details

### 2. View Appointments
- **Appointment List**: Display all patient appointments categorized as upcoming/past
- **Statistics Dashboard**: Shows total, upcoming, completed, and cancelled appointments
- **Appointment Cards**: Detailed view with doctor info, date, time, and status
- **Status Indicators**: Visual badges for appointment status (scheduled, completed, cancelled)

### 3. Cancel / Reschedule
- **Cancel Appointments**: One-click cancellation with confirmation dialog
- **Reschedule Appointments**: Complete rescheduling flow with new date/time selection
- **Validation**: Prevents cancellation/rescheduling of past appointments

### 4. Doctor Availability
- **Working Hours**: Each doctor has predefined working hours per day
- **Time Slot Generation**: Automatic generation of available time slots
- **Double Booking Prevention**: Server-side validation prevents conflicts
- **Real-time Availability**: Live checking of available slots when booking

## Technical Implementation

### Data Models

#### Appointment
```typescript
interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  date: string // YYYY-MM-DD format
  time: string // HH:MM format
  status: 'scheduled' | 'cancelled' | 'completed'
  notes?: string
  createdAt: string
  updatedAt: string
  // Legacy fields for backward compatibility
  name?: string
  phone?: string
  problem?: string
  appointmentType?: string
}
```

#### Doctor
```typescript
interface Doctor {
  id: string
  name: string
  specialty: string
  experience: string
  email?: string
  phone?: string
}
```

#### Availability
```typescript
interface Availability {
  id: string
  doctor_id: string
  day_of_week: number // 0-6 (Sunday-Saturday)
  start_time: string // HH:MM format
  end_time: string // HH:MM format
  is_active: boolean
}
```

### API Endpoints

#### Appointments API (`/api/appointments`)
- **GET**: Fetch appointments with optional filtering
  - Query parameters: `doctorId`, `date`, `patientId`, `status`
- **POST**: Create new appointment
- **PUT**: Update existing appointment (for rescheduling)
- **DELETE**: Cancel appointment

#### Doctors API (`/api/doctors`)
- **GET**: Fetch all available doctors

#### Availability API (`/api/availability`)
- **GET**: Get doctor availability and time slots
  - Query parameters: `doctorId`, `date`

### Components

#### Core Components
- `AppointmentForm`: Main booking form with doctor, date, time selection
- `DoctorSelect`: Dropdown for selecting doctors
- `TimeSlotPicker`: Grid of available time slots
- `AppointmentCard`: Display individual appointment with actions

#### Pages
- `/appointments`: Main appointments dashboard
- `/appointments/book`: Book new appointment
- `/appointments/reschedule`: Reschedule existing appointment

### Key Features

#### Validation & Error Handling
- Client-side validation using React Hook Form + Zod
- Server-side validation for business logic
- User-friendly error messages with toast notifications
- Loading states for all async operations

#### User Experience
- Responsive design for mobile and desktop
- Intuitive navigation with header and breadcrumbs
- Confirmation dialogs for destructive actions
- Success feedback with detailed information

#### Business Logic
- Prevents double booking of time slots
- Respects doctor working hours and availability
- Maintains appointment history and status tracking
- Backward compatibility with existing chatbot system

## File Structure

```
f:/ai-dentist/
├── lib/
│   ├── types.ts          # TypeScript interfaces
│   ├── data.ts            # Static data and helper functions
│   └── utils.ts           # Utility functions
├── app/
│   ├── api/
│   │   ├── appointments/  # Appointments API
│   │   ├── doctors/       # Doctors API
│   │   └── availability/   # Availability API
│   ├── appointments/
│   │   ├── page.tsx       # Appointments dashboard
│   │   ├── book/
│   │   │   └── page.tsx   # Book appointment
│   │   └── reschedule/
│   │       └── page.tsx   # Reschedule appointment
│   └── layout.tsx         # Updated with navigation header
└── components/
    ├── appointment/       # Appointment-specific components
    │   ├── appointment-form.tsx
    │   ├── appointment-card.tsx
    │   ├── doctor-select.tsx
    │   └── time-slot-picker.tsx
    ├── navigation-header.tsx
    └── hero-section.tsx    # Updated with booking links
```

## Usage

### Booking an Appointment
1. Navigate to `/appointments/book` or click "Book Appointment" in the navigation
2. Select a doctor from the dropdown
3. Choose a date from the calendar
4. Select an available time slot
5. Add optional notes
6. Submit the form
7. Receive confirmation with appointment details

### Viewing Appointments
1. Navigate to `/appointments`
2. View upcoming and past appointments in separate tabs
3. See statistics dashboard
4. Individual appointment cards show all details

### Managing Appointments
- **Cancel**: Click "Cancel" on upcoming appointments
- **Reschedule**: Click "Reschedule" to choose new date/time
- **View Details**: All appointment information displayed on cards

## Integration Notes

### Backward Compatibility
- Existing chatbot system continues to work with legacy field format
- API supports both new and legacy appointment formats
- No breaking changes to existing functionality

### Navigation Integration
- Added navigation header to all pages
- Updated hero section with direct booking links
- Doctors section now includes booking buttons

### Notification System
- Integrated toast notifications for user feedback
- Success/error messages for all operations
- Loading indicators for async operations

## Future Enhancements

### Potential Improvements
1. **Database Integration**: Replace in-memory storage with persistent database
2. **Authentication**: Add user authentication for patient accounts
3. **Email Notifications**: Send confirmation and reminder emails
4. **Calendar Integration**: Export appointments to external calendars
5. **Payment Processing**: Add payment collection for appointments
6. **Advanced Scheduling**: Recurring appointments, waitlist management

### Scalability Considerations
- Database indexing for appointment queries
- Caching for doctor availability data
- Rate limiting for API endpoints
- Audit logging for appointment changes

## Testing

### Manual Testing Checklist
- [ ] Book appointment with all required fields
- [ ] Attempt to book same time slot (should fail)
- [ ] Book appointment outside doctor hours (should show no slots)
- [ ] View appointments dashboard
- [ ] Cancel upcoming appointment
- [ ] Reschedule appointment
- [ ] Try to cancel past appointment (should be disabled)
- [ ] Navigate between pages using header
- [ ] Test responsive design on mobile
- [ ] Test error handling (invalid data, network issues)

### API Testing
- [ ] Test all API endpoints with valid data
- [ ] Test validation error responses
- [ ] Test double booking prevention
- [ ] Test filtering and sorting

## Conclusion

The Patient Appointment Scheduling feature provides a comprehensive, user-friendly system for managing dental appointments. It follows modern web development best practices with proper validation, error handling, and user experience considerations. The implementation is modular and extensible, allowing for future enhancements and integration with additional systems.
