import { useEffect, useState } from 'react';
import { httpClient } from '@lumora/api-client';
import { StatusBadge } from '@lumora/ui';
import { routes } from './routes';

export function App() {
  const [apiState, setApiState] = useState('Đang kiểm tra');
  useEffect(() => {
    let active = true;
    httpClient<{ status: string }>('/health')
      .then(data => { if (active) setApiState(data.status === 'UP' ? 'Đã kết nối' : 'Chưa sẵn sàng'); })
      .catch(() => { if (active) setApiState('Chưa kết nối'); });
    return () => { active = false; };
  }, []);
  return <main>
    <header><a className="brand" href="/">LUMORA<span>CONSIGNMENT & AUCTIONS</span></a><StatusBadge>{apiState}</StatusBadge></header>
    <section className="hero"><p className="eyebrow">CỔNG VẬN HÀNH</p><h1>Không gian làm việc<br />của Lumora.</h1><p>Bộ khung dự án đã sẵn sàng. Các chức năng dưới đây sẽ được triển khai theo từng feature.</p></section>
    <section aria-label="Các chức năng" className="features">{routes.map(route => <article key={route.id}><span className="feature-id">{route.id}</span><h2>{route.label}</h2><p>{route.status}</p></article>)}</section>
    <footer>Lumora · Bản khởi tạo kiến trúc · Chưa có chức năng nghiệp vụ hoàn chỉnh</footer>
  </main>;
}
