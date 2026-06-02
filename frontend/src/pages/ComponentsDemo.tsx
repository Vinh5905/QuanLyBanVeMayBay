import { useState } from 'react';
import { Button } from '../components/Button/Button';
import { Badge } from '../components/Badge/Badge';
import { ToastContainer } from '../components/Toast/Toast';
import { FormField, Input, Select, Textarea } from '../components/FormField/FormField';
import { LoadingState, Skeleton } from '../components/LoadingState/LoadingState';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { ErrorState } from '../components/ErrorState/ErrorState';
import { Modal } from '../components/Modal/Modal';
import { DataTable } from '../components/DataTable/DataTable';
import { Pagination } from '../components/Pagination/Pagination';
import { AppLayout } from '../components/AppLayout/AppLayout';

export default function ComponentsDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toasts, setToasts] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  const addToast = (variant: 'success' | 'error' | 'warning' | 'info') => {
    setToasts([...toasts, {
      id: Date.now().toString(),
      title: `This is a ${variant} toast`,
      description: 'Here is some detail about what happened.',
      variant
    }]);
  };

  const removeToast = (id: string) => {
    setToasts(toasts.filter(t => t.id !== id));
  };

  const tableColumns = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Flight' },
    { key: 'status', header: 'Status', render: (item: any) => <Badge variant={item.status === 'Active' ? 'success' : 'warning'}>{item.status}</Badge> }
  ];

  const tableData = [
    { id: 'VN123', name: 'Hanoi - HCMC', status: 'Active' },
    { id: 'VJ456', name: 'Hanoi - Danang', status: 'Delayed' },
  ];

  return (
    <AppLayout role="Admin">
      <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        <section>
          <h2>Typography & Design Tokens</h2>
          <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
            <h1>Heading 1 (56px)</h1>
            <h2>Heading 2 (24px)</h2>
            <p>Body Text (14px) - Inter. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </section>

        <section>
          <h2>Buttons</h2>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button isLoading>Loading</Button>
            <Button disabled>Disabled</Button>
          </div>
        </section>

        <section>
          <h2>Badges</h2>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="neutral">Neutral</Badge>
          </div>
        </section>

        <section>
          <h2>Form Fields</h2>
          <FormField label="Email Address" required>
            <Input placeholder="Enter your email" />
          </FormField>
          
          <FormField label="Password" error="Password is required">
            <Input type="password" hasError />
          </FormField>

          <FormField label="Role">
            <Select options={[
              { label: 'Admin', value: 'admin' },
              { label: 'Staff', value: 'staff' },
            ]} />
          </FormField>

          <FormField label="Comments">
            <Textarea placeholder="Leave a comment..." />
          </FormField>
        </section>

        <section>
          <h2>Feedback States</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <LoadingState text="Fetching data..." />
            
            <div>
              <h4>Skeleton Loader</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Skeleton height="32px" />
                <Skeleton height="16px" width="80%" />
                <Skeleton height="16px" width="60%" />
              </div>
            </div>
            
            <EmptyState 
              title="No flights found" 
              description="Try adjusting your search filters to find available flights."
              action={<Button variant="outline">Clear Filters</Button>}
            />
            
            <ErrorState 
              message="Failed to load the flight schedule. Please check your connection."
              onRetry={() => alert('Retrying...')}
            />
          </div>
        </section>

        <section>
          <h2>Interactive Elements</h2>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
            <Button onClick={() => addToast('success')} variant="outline">Show Success Toast</Button>
            <Button onClick={() => addToast('error')} variant="outline">Show Error Toast</Button>
          </div>
        </section>

        <section>
          <h2>Data Table & Pagination</h2>
          <DataTable columns={tableColumns} data={tableData} />
          <Pagination currentPage={page} totalPages={5} onPageChange={setPage} />
        </section>

        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          title="Confirm Action"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => setIsModalOpen(false)}>Confirm</Button>
            </>
          }
        >
          <p>Are you sure you want to proceed with this action? This cannot be undone.</p>
        </Modal>

        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    </AppLayout>
  );
}
