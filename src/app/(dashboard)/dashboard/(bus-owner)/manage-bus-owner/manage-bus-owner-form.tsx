'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BusOwner {
  id: number;
  email: string;
  name: string;
}

export default function ManageBusOwner() {
  const [owners, setOwners] = useState<BusOwner[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<BusOwner | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const router = useRouter();

  useEffect(() => {
    fetch('http://localhost:5000/api/bus-owner')
      .then((res) => res.json())
      .then((data) => setOwners(data))
      .catch((err) => console.error('Error fetching owners:', err));
  }, []);

  const handleDelete = async (id: number) => {
    await fetch(`http://localhost:5000/api/bus-owner/${id}`, {
      method: 'DELETE',
    });
    setOwners((prev) => prev.filter((o) => o.id !== id));
  };

  const handleUpdate = async () => {
    if (!selectedOwner) {
      return;
    }

    setLoading(true);
    await fetch(`http://localhost:5000/api/bus-owner/${selectedOwner.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selectedOwner),
    });

    setOwners((prev) =>
      prev.map((o) => (o.id === selectedOwner.id ? selectedOwner : o))
    );
    setLoading(false);
    setIsDialogOpen(false);
  };

  // Pagination logic
  const totalPages = Math.ceil(owners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = owners.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between">
        <h1 className="font-bold text-2xl">Manage Bus Owners</h1>
        <Button onClick={() => router.push('/dashboard/add-bus-owner')}>
          Add Bus Owner
        </Button>
      </div>

      <table className="w-full rounded-lg border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((owner) => (
            <tr key={owner.id}>
              <td className="border p-2">{owner.id}</td>
              <td className="border p-2">{owner.name}</td>
              <td className="border p-2">{owner.email}</td>
              <td className="flex justify-center gap-2 border p-2">
                <Button
                  onClick={() => {
                    setSelectedOwner(owner);
                    setIsDialogOpen(true);
                  }}
                  variant="outline"
                >
                  Update
                </Button>
                <Button
                  onClick={() => handleDelete(owner.id)}
                  variant="destructive"
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="mt-4 flex justify-center gap-2">
        <Button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          variant="ghost"
        >
          Prev
        </Button>
        {Array.from({ length: totalPages }, (_, i) => (
          <Button
            key={`page-${i + 1}`}
            onClick={() => setCurrentPage(i + 1)}
            variant={currentPage === i + 1 ? 'default' : 'outline'}
          >
            {i + 1}
          </Button>
        ))}
        <Button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          variant="ghost"
        >
          Next
        </Button>
      </div>

      {/* Update Owner Dialog */}
      <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Bus Owner</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                onChange={(e) =>
                  setSelectedOwner((prev) =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
                value={selectedOwner?.name || ''}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                onChange={(e) =>
                  setSelectedOwner((prev) =>
                    prev ? { ...prev, email: e.target.value } : null
                  )
                }
                value={selectedOwner?.email || ''}
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleUpdate}>
              {loading ? 'Updating...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
