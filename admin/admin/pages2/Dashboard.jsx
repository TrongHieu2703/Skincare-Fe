import React from 'react';
import styles from './Dashboard.module.css';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { FaUsers, FaTasks, FaClock } from 'react-icons/fa';
import Sidebar from './Sidebar';

const taskData = [
  { month: 'Tháng 1', completed: 40, pending: 20 },
  { month: 'Tháng 2', completed: 30, pending: 12 },
  { month: 'Tháng 3', completed: 18, pending: 38 },
  { month: 'Tháng 4', completed: 28, pending: 30 },
  { month: 'Tháng 5', completed: 17, pending: 50 },
  { month: 'Tháng 6', completed: 22, pending: 15 },
];

const attendanceData = [
  { name: 'Present', value: 113 },
  { name: 'Absent', value: 14 },
  { name: 'Late', value: 29 },
];

const COLORS = ['#4b4ded', '#00C49F', '#FF69B4'];

const StaffDashboard = () => {
  const totalAttendance = attendanceData.reduce((acc, item) => acc + item.value, 0);

  return (
    <>
      <Sidebar />
      <div className={styles.container}>
        <h2 className={styles.title}>Tổng Quan Nhân Viên</h2>

        <div className={styles.cards}>
          <div className={styles.card}>
            <FaTasks className={styles.icon} />
            <div>
              <h3>Tổng công việc</h3>
              <p className={styles.value}>280</p>
              <span className={styles.green}>⬆ 35% so với 7 ngày trước</span>
            </div>
          </div>

          <div className={styles.card}>
            <FaClock className={styles.icon} />
            <div>
              <h3>Giờ làm việc</h3>
              <p className={styles.value}>920 giờ</p>
              <span className={styles.green}>⬆ 16% so với 7 ngày trước</span>
            </div>
          </div>

          <div className={styles.card}>
            <FaUsers className={styles.icon} />
            <div>
              <h3>Nhân viên</h3>
              <p className={styles.value}>56</p>
              <span className={styles.green}>⬆ 24% so với 7 ngày trước</span>
            </div>
          </div>
        </div>

        <div className={styles.charts}>
          <div className={styles.barChart}>
            <h3>Công việc theo tháng</h3>
            <BarChart width={600} height={300} data={taskData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#4b4ded" name="Hoàn thành" />
              <Bar dataKey="pending" fill="#aab0f5" name="Chưa hoàn thành" />
            </BarChart>
          </div>

          <div className={styles.pieChart}>
            <h3>Điểm danh</h3>
            <PieChart width={300} height={300}>
              <Pie
                data={attendanceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                label
              >
                {attendanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
            <p className={styles.total}>Tổng: {totalAttendance.toLocaleString()}</p>
            <ul className={styles.legend}>
              {attendanceData.map((item, idx) => (
                <li key={idx}>
                  <span style={{ backgroundColor: COLORS[idx] }}></span>
                  {item.name}: {item.value.toLocaleString()}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default StaffDashboard;