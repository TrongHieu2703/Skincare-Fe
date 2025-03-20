import React, { useEffect, useState } from 'react';
import { getAllInventories, createInventory, updateInventory, deleteInventory } from '../api/inventoryApi';

const InventoryManagement = () => {
  const [inventories, setInventories] = useState([]);
  const [newInventory, setNewInventory] = useState({ name: '', quantity: 0 });
  const [loading, setLoading] = useState(false);

  const fetchInventories = async () => {
    setLoading(true);
    try {
      const response = await getAllInventories();
      setInventories(response.data);
    } catch (error) {
      console.error("Error fetching inventories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInventory = async () => {
    try {
      await createInventory(newInventory);
      fetchInventories(); // Refresh the inventory list
      setNewInventory({ name: '', quantity: 0 }); // Reset form
    } catch (error) {
      console.error("Error creating inventory:", error);
    }
  };

  const handleUpdateInventory = async (id) => {
    try {
      await updateInventory(id, newInventory);
      fetchInventories(); // Refresh the inventory list
    } catch (error) {
      console.error("Error updating inventory:", error);
    }
  };

  const handleDeleteInventory = async (id) => {
    try {
      await deleteInventory(id);
      fetchInventories(); // Refresh the inventory list
    } catch (error) {
      console.error("Error deleting inventory:", error);
    }
  };

  useEffect(() => {
    fetchInventories();
  }, []);

  return (
    <div>
      <h1>Inventory Management</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {inventories.map((inventory) => (
            <li key={inventory.id}>
              {inventory.name} - {inventory.quantity}
              <button onClick={() => handleUpdateInventory(inventory.id)}>Update</button>
              <button onClick={() => handleDeleteInventory(inventory.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
      <h2>Add New Inventory</h2>
      <input
        type="text"
        placeholder="Name"
        value={newInventory.name}
        onChange={(e) => setNewInventory({ ...newInventory, name: e.target.value })}
      />
      <input
        type="number"
        placeholder="Quantity"
        value={newInventory.quantity}
        onChange={(e) => setNewInventory({ ...newInventory, quantity: Number(e.target.value) })}
      />
      <button onClick={handleCreateInventory}>Add Inventory</button>
    </div>
  );
};

export default InventoryManagement; 