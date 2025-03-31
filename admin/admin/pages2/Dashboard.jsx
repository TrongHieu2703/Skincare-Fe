import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Col, 
  Row, 
  Statistic, 
  Table,
  Select,
  Space,
  Alert,
  Typography,
  DatePicker,
  Button,
  Tooltip,
  Image,
  Tag,
  Spin
} from 'antd';
import {
  ShoppingOutlined,
  UserOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  StarOutlined,
  BoxPlotOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons';
import { 
  LineChart,
  Line as RechartsLine, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import dayjs from 'dayjs';
import dashboardApi from '../../../src/api/dashboardApi';
import Sidebar from './Sidebar';
import styles from './Dashboard.module.css';
import { formatProductImageUrl } from '../../../src/utils/imageUtils';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Dashboard = () => {
  // State for dashboard data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  
  // Time period filter state
  const [timeFilter, setTimeFilter] = useState('30d');
  const [customDateRange, setCustomDateRange] = useState(null);
  
  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(value);
  };
  
  // Handle time period change
  const handleTimeFilterChange = (value) => {
    setTimeFilter(value);
    if (value !== 'custom') {
      setCustomDateRange(null);
    }
  };
  
  // Handle custom date range change
  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setCustomDateRange({
        startDate: dates[0].toDate(),
        endDate: dates[1].toDate()
      });
      setTimeFilter('custom');
    } else {
      setCustomDateRange(null);
    }
  };
  
  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (timeFilter === 'custom' && customDateRange) {
        response = await dashboardApi.getAllStats(
          timeFilter,
          customDateRange.startDate,
          customDateRange.endDate
        );
      } else {
        response = await dashboardApi.getAllStats(timeFilter);
      }
      
      setDashboardData(response.data);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu:', err);
      setError('Không thể tải dữ liệu báo cáo. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch data on component mount and when filter changes
  useEffect(() => {
    fetchDashboardData();
  }, [timeFilter, customDateRange]);
  
  // Get status label in Vietnamese
  const getStatusLabel = (status) => {
    if (!status) return "Đang xử lý";
    switch (status) {
      case "Delivered": return "Đã giao hàng";
      case "Shipped": return "Đang giao hàng";
      case "Processing": return "Đang xử lý";
      case "Confirmed": return "Đã xác nhận";
      case "Cancelled": return "Đã hủy";
      case "Pending": return "Chờ xử lý";
      default: return status;
    }
  };
  
  // Order status distribution chart configuration
  const PieChartComponent = ({ data }) => {
    if (!data || data.length === 0) {
      return (
        <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Text type="secondary">Không có dữ liệu trạng thái đơn hàng cho khoảng thời gian đã chọn</Text>
        </div>
      );
    }

    // Các màu cho từng phần của biểu đồ
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A4DE6C', '#8884D8'];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="count"
            nameKey="status"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <RechartsTooltip 
            formatter={(value, name, props) => [`${value} đơn hàng (${props.payload.percentage}%)`, props.payload.status]}
          />
          <Legend layout="horizontal" verticalAlign="bottom" align="center" />
        </PieChart>
      </ResponsiveContainer>
    );
  };
  
  // Revenue by time chart configuration
  const RevenueLineChart = ({ data }) => {
    if (!data || data.length === 0) {
      return (
        <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Text type="secondary">Không có dữ liệu doanh thu cho khoảng thời gian đã chọn</Text>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis 
            tickFormatter={(value) => `${value.toLocaleString()}đ`}
          />
          <RechartsTooltip 
            formatter={(value) => [`${value.toLocaleString()}đ`, 'Doanh thu']}
            labelFormatter={(label) => `Thời gian: ${label}`}
          />
          <Legend />
          <RechartsLine 
            type="monotone" 
            dataKey="value" 
            name="Doanh thu" 
            stroke="#8884d8" 
            activeDot={{ r: 8 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };
  
  // Orders by time chart configuration
  const OrdersLineChart = ({ data }) => {
    if (!data || data.length === 0) {
      return (
        <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Text type="secondary">Không có dữ liệu đơn hàng cho khoảng thời gian đã chọn</Text>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <RechartsTooltip 
            formatter={(value) => [value, 'Đơn hàng']}
            labelFormatter={(label) => `Thời gian: ${label}`}
          />
          <Legend />
          <RechartsLine 
            type="monotone" 
            dataKey="value" 
            name="Đơn hàng" 
            stroke="#82ca9d" 
            activeDot={{ r: 8 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };
  
  // Best sellers table columns
  const bestSellersColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          {record.image && (
            <Image 
              src={formatProductImageUrl(record.image)} 
              width={40} 
              height={40} 
              style={{ objectFit: 'cover' }}
              preview={false}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "../src/assets/images/aboutus.jpg";
              }}
            />
          )}
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price.toLocaleString()}đ`,
    },
    {
      title: 'Đã bán',
      dataIndex: 'quantitySold',
      key: 'quantitySold',
    },
    {
      title: 'Đánh giá',
      dataIndex: 'averageRating',
      key: 'averageRating',
      render: (rating, record) => rating ? (
        <Space>
          <StarOutlined style={{ color: '#FADB14' }} />
          <Text>{rating.toFixed(1)}</Text>
          <Text type="secondary">({record.reviewsCount})</Text>
        </Space>
      ) : 'Chưa có đánh giá',
    }
  ];
  
  // Low stock warnings table columns
  const lowStockColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          {record.image && (
            <Image 
              src={formatProductImageUrl(record.image)} 
              width={40} 
              height={40} 
              style={{ objectFit: 'cover' }}
              preview={false}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "../src/assets/images/aboutus.jpg";
              }}
            />
          )}
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'currentStock',
      key: 'currentStock',
      render: (stock) => (
        <Tag color={stock <= 5 ? 'red' : 'orange'}>
          {stock} {stock <= 5 ? '(Nghiêm trọng)' : '(Thấp)'}
        </Tag>
      ),
    }
  ];
  
  // If loading or error, show appropriate message
  if (loading) {
  return (
      <div className={styles.container}>
        <Sidebar />
        <div className={styles.content}>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '20px' }}>Đang tải dữ liệu...</div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={styles.container}>
        <Sidebar />
        <div className={styles.content}>
          <Alert
            message="Lỗi"
            description={error}
            type="error"
            showIcon
            style={{ margin: '20px' }}
          />
            </div>
          </div>
    );
  }
  
  // If no data yet, return empty
  if (!dashboardData) {
    return (
      <div className={styles.container}>
        <Sidebar />
        <div className={styles.content}>
          <div>Không có dữ liệu</div>
            </div>
          </div>
    );
  }
  
  // Destructure data for easier access
  const { 
    productStats, 
    customerStats, 
    orderStats, 
    revenueStats, 
    bestSellers, 
    topRated,
    timeRange 
  } = dashboardData;
  
  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <h1>Thống kê</h1>
        
        <div className={styles.filterSection}>
          <Space>
            <Select 
              value={timeFilter} 
              onChange={handleTimeFilterChange}
              style={{ width: 140 }}
            >
              <Option value="24h">24 giờ qua</Option>
              <Option value="7d">7 ngày qua</Option>
              <Option value="30d">30 ngày qua</Option>
              <Option value="12m">12 tháng qua</Option>
              <Option value="all">Tất cả thời gian</Option>
              <Option value="custom">Tùy chỉnh</Option>
            </Select>
            
            {(timeFilter === 'custom' || customDateRange) && (
              <RangePicker 
                value={customDateRange ? [dayjs(customDateRange.startDate), dayjs(customDateRange.endDate)] : null}
                onChange={handleDateRangeChange}
              />
            )}
            
            <Button 
              type="primary" 
              onClick={fetchDashboardData}
            >
              Làm mới
            </Button>
          </Space>
        </div>

        <Row gutter={[16, 16]}>
          {/* Product Statistics */}
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic 
                title="Tổng sản phẩm" 
                value={productStats.totalProducts}
                prefix={<BoxPlotOutlined />}
              />
              <div style={{ marginTop: '10px' }}>
                <Text type="secondary">
                  {productStats.inStockProducts} còn hàng ({Math.round(productStats.inStockProducts / productStats.totalProducts * 100)}%)
                </Text>
              </div>
            </Card>
          </Col>
          
          {/* Low Stock Warning */}
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic 
                title="Sản phẩm sắp hết" 
                value={productStats.lowStockProducts}
                valueStyle={{ color: productStats.lowStockProducts > 0 ? '#faad14' : '#3f8600' }}
                prefix={<WarningOutlined />}
              />
              <div style={{ marginTop: '10px' }}>
                <Text type={productStats.lowStockProducts > 0 ? 'warning' : 'secondary'}>
                  {productStats.lowStockProducts > 0 
                    ? `${productStats.lowStockProducts} sản phẩm cần nhập thêm` 
                    : 'Tất cả sản phẩm đều đủ hàng'}
                </Text>
              </div>
            </Card>
          </Col>
          
          {/* Units Sold */}
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic 
                title="Tổng sản phẩm đã bán" 
                value={productStats.totalProductsSold}
                prefix={<ShoppingOutlined />}
              />
              <div style={{ marginTop: '10px' }}>
                <Text type="secondary">
                  Trong khoảng thời gian đã chọn
                </Text>
              </div>
            </Card>
          </Col>
          
          {/* Customer Statistics */}
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic 
                title="Tổng khách hàng" 
                value={customerStats.totalCustomers}
                prefix={<UserOutlined />}
              />
              <div style={{ marginTop: '10px' }}>
                <Text type="secondary">
                  {customerStats.newCustomers} khách mới trong kỳ
                </Text>
              </div>
            </Card>
          </Col>
          
          {/* Order Statistics */}
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic 
                title="Tổng đơn hàng" 
                value={orderStats.totalOrders}
                prefix={<ShoppingCartOutlined />}
              />
              <div style={{ marginTop: '10px' }}>
                <Space>
                  <Tag color="blue">
                    <ClockCircleOutlined /> {orderStats.pendingOrders} Chờ xử lý
                  </Tag>
                  <Tag color="green">
                    <CheckCircleOutlined /> {orderStats.deliveredOrders} Đã giao
                  </Tag>
                </Space>
              </div>
            </Card>
          </Col>
          
          {/* Revenue Statistics */}
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic 
                title="Tổng doanh thu" 
                value={revenueStats.totalRevenue}
                precision={0}
                prefix={<DollarOutlined />}
                formatter={(value) => `${value.toLocaleString()}đ`}
              />
              <div style={{ marginTop: '10px' }}>
                <Text type="secondary">
                  Giá trị trung bình: {`${revenueStats.averageOrderValue.toLocaleString()}đ`}
                </Text>
              </div>
            </Card>
          </Col>
          
          {/* Best Selling Product */}
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic 
                title="Sản phẩm bán chạy nhất" 
                value={bestSellers.length > 0 ? bestSellers[0].name : 'Không có dữ liệu'}
                valueStyle={{ fontSize: '16px' }}
              />
              {bestSellers.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <Space>
                    <Text>{bestSellers[0].quantitySold} đã bán</Text>
                    {bestSellers[0].averageRating && (
                      <Text>
                        <StarOutlined style={{ color: '#FADB14' }} /> {bestSellers[0].averageRating.toFixed(1)}
                      </Text>
                    )}
                  </Space>
                </div>
              )}
            </Card>
          </Col>
          
          {/* Top Rated Product */}
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic 
                title="Sản phẩm đánh giá cao nhất" 
                value={topRated.length > 0 ? topRated[0].name : 'Không có dữ liệu'}
                valueStyle={{ fontSize: '16px' }}
              />
              {topRated.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <Space>
                    <Text>
                      <StarOutlined style={{ color: '#FADB14' }} /> {topRated[0].averageRating.toFixed(1)}
                    </Text>
                    <Text type="secondary">
                      ({topRated[0].reviewsCount} lượt đánh giá)
                    </Text>
                  </Space>
                </div>
              )}
            </Card>
          </Col>
          
          {/* Revenue Chart */}
          <Col xs={24} lg={12}>
            <Card title="Xu hướng doanh thu">
              {revenueStats.revenueByTime.length > 0 ? (
                <RevenueLineChart data={revenueStats.revenueByTime} />
              ) : (
                <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Text type="secondary">Không có dữ liệu doanh thu cho khoảng thời gian đã chọn</Text>
                </div>
              )}
            </Card>
          </Col>
          
          {/* Orders Chart */}
          <Col xs={24} lg={12}>
            <Card title="Xu hướng đơn hàng">
              {orderStats.ordersByTime.length > 0 ? (
                <OrdersLineChart data={orderStats.ordersByTime} />
              ) : (
                <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Text type="secondary">Không có dữ liệu đơn hàng cho khoảng thời gian đã chọn</Text>
                </div>
              )}
            </Card>
          </Col>
          
          {/* Order Status Distribution */}
          <Col xs={24} lg={12}>
            <Card title="Phân bố trạng thái đơn hàng">
              {orderStats.orderStatusDistribution.length > 0 ? (
                <PieChartComponent 
                  data={orderStats.orderStatusDistribution.map(item => ({
                    ...item,
                    status: getStatusLabel(item.status)
                  }))} 
                />
              ) : (
                <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Text type="secondary">Không có dữ liệu trạng thái đơn hàng cho khoảng thời gian đã chọn</Text>
                </div>
              )}
            </Card>
          </Col>
          
          {/* Low Stock Warnings */}
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <WarningOutlined style={{ color: '#faad14' }} />
                  <span>Cảnh báo hàng sắp hết</span>
                </Space>
              }
            >
              {productStats.lowStockWarnings.length > 0 ? (
                <Table 
                  dataSource={productStats.lowStockWarnings} 
                  columns={lowStockColumns}
                  rowKey="id"
                  pagination={false}
                  scroll={{ y: 240 }}
                  size="small"
                />
              ) : (
                <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Text type="success">Tất cả sản phẩm đều đủ hàng</Text>
                </div>
              )}
            </Card>
          </Col>
          
          {/* Best Selling Products */}
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <RiseOutlined style={{ color: '#52c41a' }} />
                  <span>Sản phẩm bán chạy nhất</span>
                </Space>
              }
            >
              <Table 
                dataSource={bestSellers} 
                columns={bestSellersColumns}
                rowKey="id"
                pagination={false}
                scroll={{ y: 240 }}
                size="small"
              />
            </Card>
          </Col>
          
          {/* Top Rated Products */}
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <StarOutlined style={{ color: '#FADB14' }} />
                  <span>Sản phẩm đánh giá cao nhất</span>
                </Space>
              }
            >
              <Table 
                dataSource={topRated} 
                columns={bestSellersColumns.filter(col => col.key !== 'quantitySold')}
                rowKey="id"
                pagination={false}
                scroll={{ y: 240 }}
                size="small"
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Dashboard;