import React from 'react';
import styles from './Dashboard.module.css';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { FaUsers, FaShoppingCart, FaMoneyBillAlt } from 'react-icons/fa';
import Sidebar from './Sidebar';

const orderData = [
  { month: 'Tháng 1', thisYear: 400, lastYear: 200 },
  { month: 'Tháng 2', thisYear: 300, lastYear: 120 },
  { month: 'Tháng 3', thisYear: 180, lastYear: 380 },
  { month: 'Tháng 4', thisYear: 280, lastYear: 300 },
  { month: 'Tháng 5', thisYear: 170, lastYear: 500 },
  { month: 'Tháng 6', thisYear: 220, lastYear: 150 },
];

const deviceData = [
  { name: 'Android', value: 11313 },
  { name: 'iPhone', value: 8914 },
  { name: 'Mac', value: 12966 },
  { name: 'Windows', value: 7296 },
];

const COLORS = ['#4b4ded', '#00C49F', '#FF69B4', '#FFD700'];

const Overview = () => {
  const totalSessions = deviceData.reduce((acc, item) => acc + item.value, 0);

  return (
    <>
      <Sidebar />
      <div className={styles.container}>
        <h2 className={styles.title}>Tổng Quan</h2>

        <div className={styles.cards}>
          <div className={styles.card}>
            <FaShoppingCart className={styles.icon} />
            <div>
              <h3>Tổng đơn hàng</h3>
              <p className={styles.value}>280</p>
              <span className={styles.green}>⬆ 35% so với 7 ngày trước</span>
            </div>
          </div>

          <div className={styles.card}>
            <FaMoneyBillAlt className={styles.icon} />
            <div>
              <h3>Doanh thu</h3>
              <p className={styles.value}>92.000.129đ </p>
              <span className={styles.green}>⬆ 16% so với 7 ngày trước</span>
            </div>
          </div>

          <div className={styles.card}>
            <FaUsers className={styles.icon} />
            <div>
              <h3>Người dùng</h3>
              <p className={styles.value}>560,410</p>
              <span className={styles.green}>⬆ 24% so với 7 ngày trước</span>
            </div>
          </div>
        </div>

        <div className={styles.charts}>
          <div className={styles.barChart}>
            <h3>Đơn hàng theo tháng</h3>
            <BarChart width={600} height={300} data={orderData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="thisYear" fill="#4b4ded" name="Năm nay" />
              <Bar dataKey="lastYear" fill="#aab0f5" name="Năm trước" />
            </BarChart>
          </div>

          <div className={styles.pieChart}>
            <h3>Phiên truy cập theo thiết bị</h3>
            <PieChart width={300} height={300}>
              <Pie
                data={deviceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                label
              >
                {deviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
            <p className={styles.total}>Tổng: {totalSessions.toLocaleString()}</p>
            <ul className={styles.legend}>
              {deviceData.map((item, idx) => (
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

export default Overview;
