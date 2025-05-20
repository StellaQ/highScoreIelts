import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import {
  BookOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import Part1 from '../pages/part1';
import Part2 from '../pages/part2';
import Part3 from '../pages/part3';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    {
      key: 'question-bank',
      icon: <DatabaseOutlined />,
      label: '题库系统',
      children: [
        {
          key: '/part1',
          icon: <BookOutlined />,
          label: <Link to="/part1">Part 1</Link>,
        },
        {
          key: '/part2',
          icon: <BookOutlined />,
          label: <Link to="/part2">Part 2</Link>,
        },
        {
          key: '/part3',
          icon: <BookOutlined />,
          label: <Link to="/part3">Part 3</Link>,
        },
      ],
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider style={{ background: '#fff' }}>
        <div className="logo" />
        <Menu
          mode="inline"
          defaultSelectedKeys={[location.pathname]}
          defaultOpenKeys={['question-bank']}
          items={menuItems}
          style={{ height: '100%', borderRight: 1 }}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: '#fff' }} />
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', borderRadius: '4px' }}>
          <Routes>
            <Route path="/part1" element={<Part1 />} />
            <Route path="/part2" element={<Part2 />} />
            <Route path="/part3" element={<Part3 />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 