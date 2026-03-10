'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Phone, User, AlertCircle, CheckCircle2, Loader2, LogOut } from 'lucide-react';
import { format } from 'date-fns';

interface Appointment {
  id?: string;
  _id?: string;
  name: string;
  phone: string;
  problem: string;
  date: string;
  time: string;
  appointmentType: string;
  createdAt: string;
  status?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    pending: 0,
    confirmed: 0,
  });

  useEffect(() => {
    // Check if user is authenticated
    const authToken = localStorage.getItem('adminAuth');
    if (!authToken) {
      router.push('/admin/login');
      return;
    }
    setIsAuthenticated(true);
    fetchAppointments();
  }, [router]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      // Replace with your actual API endpoint
      const response = await fetch('/api/appointments');
      if (!response.ok) throw new Error('Failed to fetch appointments');
      const result = await response.json();
      const appointments = result.data || result;
      setAppointments(appointments);
      calculateStats(appointments);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // For demo purposes, load sample data
      loadSampleData();
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = () => {
    const sampleAppointments: Appointment[] = [
      {
        _id: '1',
        name: 'John Doe',
        phone: '555-0101',
        problem: 'Root Canal Treatment',
        date: '2024-03-15',
        time: '10:00 AM',
        appointmentType: 'Treatment',
        createdAt: new Date().toISOString(),
      },
      {
        _id: '2',
        name: 'Sarah Johnson',
        phone: '555-0102',
        problem: 'Teeth Cleaning',
        date: '2024-03-15',
        time: '02:00 PM',
        appointmentType: 'Cleaning',
        createdAt: new Date().toISOString(),
      },
      {
        _id: '3',
        name: 'Mike Smith',
        phone: '555-0103',
        problem: 'Consultation',
        date: '2024-03-16',
        time: '11:00 AM',
        appointmentType: 'Consultation',
        createdAt: new Date().toISOString(),
      },
      {
        _id: '4',
        name: 'Emily Brown',
        phone: '555-0104',
        problem: 'Emergency Dental Care',
        date: '2024-03-14',
        time: '03:30 PM',
        appointmentType: 'Emergency',
        createdAt: new Date().toISOString(),
      },
      {
        _id: '5',
        name: 'David Wilson',
        phone: '555-0105',
        problem: 'Teeth Whitening',
        date: '2024-03-17',
        time: '09:00 AM',
        appointmentType: 'Cosmetic',
        createdAt: new Date().toISOString(),
      },
    ];
    setAppointments(sampleAppointments);
    calculateStats(sampleAppointments);
  };

  const calculateStats = (data: Appointment[]) => {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = data.filter(apt => apt.date === today);

    setStats({
      total: data.length,
      today: todayAppointments.length,
      pending: data.length - 2,
      confirmed: 2,
    });
  };

  const getAppointmentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Consultation': 'bg-blue-100 text-blue-800',
      'Cleaning': 'bg-green-100 text-green-800',
      'Treatment': 'bg-purple-100 text-purple-800',
      'Emergency': 'bg-red-100 text-red-800',
      'Cosmetic': 'bg-pink-100 text-pink-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const StatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: number }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <p className="text-2xl font-bold mt-2">{value}</p>
          </div>
          <Icon className="w-8 h-8 text-blue-500" />
        </div>
      </CardContent>
    </Card>
  );

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminLoginTime');
    router.push('/admin/login');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">SmileCare Dental Clinic - Appointment Management</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Calendar} label="Total Appointments" value={stats.total} />
          <StatCard icon={Clock} label="Today's Appointments" value={stats.today} />
          <StatCard icon={AlertCircle} label="Pending" value={stats.pending} />
          <StatCard icon={CheckCircle2} label="Confirmed" value={stats.confirmed} />
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <p className="text-sm text-yellow-800">
                ℹ️ Using sample data. Connect your backend at: <code className="bg-yellow-100 px-2 py-1 rounded">POST /api/appointments</code>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Appointments Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Scheduled Appointments</CardTitle>
                <CardDescription>All patient appointments and booking details</CardDescription>
              </div>
              <Button onClick={fetchAppointments} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  'Refresh'
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading && appointments.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No appointments scheduled yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Patient Name</TableHead>
                      <TableHead className="font-semibold">Phone</TableHead>
                      <TableHead className="font-semibold">Issue</TableHead>
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Time</TableHead>
                      <TableHead className="font-semibold">Booked</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment) => (
                      <TableRow key={appointment.id || appointment._id} className="hover:bg-gray-50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-700" />
                            </div>
                            <span className="font-medium">{appointment.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {appointment.phone}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{appointment.problem}</TableCell>
                        <TableCell>
                          <Badge className={getAppointmentTypeColor(appointment.appointmentType)}>
                            {appointment.appointmentType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {format(new Date(appointment.date), 'MMM dd, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {appointment.time}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {format(new Date(appointment.createdAt), 'MMM dd')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>SmileCare Dental Clinic © 2024. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
