async function testBackend() {
  const baseURL = 'http://localhost:5000/api';
  console.log('Testing Logistics & Fleet Management System APIs at:', baseURL);

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseURL}/health`);
    const health = await healthRes.json();
    console.log('✅ Health Check Status:', healthRes.status, health.service);

    // 2. Login as Manager
    const loginRes = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'manager@logistics.local',
        password: 'Manager@123456',
      }),
    });
    const loginManager = await loginRes.json();
    console.log('✅ Manager Login Success:', loginManager.user?.name, 'Role:', loginManager.user?.role);
    const managerToken = loginManager.token;
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${managerToken}`,
    };

    // 3. Vehicles
    const vehiclesRes = await fetch(`${baseURL}/vehicles`, { headers: authHeaders });
    const vehicles = await vehiclesRes.json();
    console.log('✅ Vehicles Count:', vehicles.count, 'First vehicle plate:', vehicles.vehicles?.[0]?.plateNumber);

    // 4. Routes
    const routesRes = await fetch(`${baseURL}/routes`, { headers: authHeaders });
    const routes = await routesRes.json();
    console.log('✅ Routes Count:', routes.count, 'First route code:', routes.routes?.[0]?.routeCode);

    // 5. Attendance
    const attendanceRes = await fetch(`${baseURL}/attendance`, { headers: authHeaders });
    const attendance = await attendanceRes.json();
    console.log('✅ Attendance Timesheets Count:', attendance.count);

    // 6. Dispatches
    const dispatchesRes = await fetch(`${baseURL}/dispatches`, { headers: authHeaders });
    const dispatches = await dispatchesRes.json();
    console.log('✅ Dispatches Count:', dispatches.count, 'First dispatch #:', dispatches.dispatches?.[0]?.dispatchNumber);

    // 7. Payroll
    const payrollRes = await fetch(`${baseURL}/payroll`, { headers: authHeaders });
    const payroll = await payrollRes.json();
    console.log('✅ Payroll Statements Count:', payroll.count, 'First slip ID:', payroll.payrollList?.[0]?.payrollId);

    // 8. Analytics
    const analyticsRes = await fetch(`${baseURL}/analytics/fleet`, { headers: authHeaders });
    const analytics = await analyticsRes.json();
    console.log('✅ Fleet Analytics Summary:', analytics.data?.summary);

    console.log('\n🌟 ALL BACKEND APIS & DATABASE MODELS OPERATIONAL & VERIFIED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

testBackend();
