import { Spin, Table, message } from "antd";
import { authHeaders } from "../../config/auth";
import { useEffect, useState } from "react";

const OrderPage = () => {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const columns = [
    {
      title: "Müşteri Email",
      dataIndex: "email",
    },
    {
      title: "Sipariş Fiyatı",
      dataIndex: "amount",
      render: (amount) => <span>${amount.toFixed(2)}</span>,
    },
    {
      title: "Ödeme Durumu",
      dataIndex: "status",
    },
    {
      title: "Tarih",
      dataIndex: "createdAt",
      render: (date) => new Date(date).toLocaleString("tr-TR"),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const response = await fetch(`${apiUrl}/api/payment/orders`, {
          headers: authHeaders(),
        });

        if (response.ok) {
          const data = await response.json();
          setDataSource(data);
        } else {
          message.error("Veri getirme başarısız.");
        }
      } catch (error) {
        console.log("Veri hatası:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiUrl]);

  return (
    <Spin spinning={loading}>
      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey={(record) => record.id}
        loading={loading}
      />
    </Spin>
  );
};

export default OrderPage;
