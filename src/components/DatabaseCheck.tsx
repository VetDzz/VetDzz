import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface TableCheck {
  name: string;
  exists: boolean;
  error?: string;
}

const DatabaseCheck: React.FC = () => {
  const [tables, setTables] = useState<TableCheck[]>([]);
  const [loading, setLoading] = useState(false);

  const requiredTables = [
    'pad_requests',
    'client_profiles',
    'vet_profiles',
    'notifications',
    'medical_results'
  ];

  const checkTables = async () => {
    setLoading(true);
    const results: TableCheck[] = [];

    for (const tableName of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        results.push({
          name: tableName,
          exists: !error,
          error: error?.message
        });
      } catch (err) {
        results.push({
          name: tableName,
          exists: false,
          error: 'Connection error'
        });
      }
    }

    setTables(results);
    setLoading(false);
  };

  const createPADTable = async () => {
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS PAD_requests (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            vet_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
            message TEXT,
            client_location_lat DECIMAL(10, 8),
            client_location_lng DECIMAL(11, 8),
            client_name VARCHAR(255),
            client_phone VARCHAR(20),
            client_address TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          ALTER TABLE PAD_requests ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Users can view their PAD requests" ON PAD_requests 
            FOR SELECT USING (auth.uid() = client_id OR auth.uid() = vet_id);
          
          CREATE POLICY "Users can create PAD requests" ON PAD_requests 
            FOR INSERT WITH CHECK (auth.uid() = client_id OR auth.uid() = vet_id);
        `
      });

      if (error) {

        alert('Error creating table. Please run the SQL manually in Supabase.');
      } else {
        alert('PAD_requests table created successfully!');
        checkTables();
      }
    } catch (err) {

      alert('Error creating table. Please run the SQL manually in Supabase.');
    }
  };

  useEffect(() => {
    checkTables();
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Database Status Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={checkTables} disabled={loading}>
          {loading ? 'Checking...' : 'Refresh Check'}
        </Button>

        <div className="space-y-2">
          {tables.map((table) => (
            <div key={table.name} className="flex items-center justify-between p-3 border rounded">
              <span className="font-medium">{table.name}</span>
              <div className="flex items-center gap-2">
                {table.exists ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className={table.exists ? 'text-green-600' : 'text-red-600'}>
                  {table.exists ? 'EXISTS' : 'MISSING'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {tables.some(t => t.name === 'pad_requests' && !t.exists) && (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <h3 className="font-semibold text-red-800 mb-2">pad_requests table is missing!</h3>
            <p className="text-red-700 mb-3">
              This is why PAD requests are failing. You need to create this table in your Supabase database.
            </p>
            <div className="space-y-2">
              <Button onClick={createPADTable} className="bg-red-600 hover:bg-red-700">
                Try Auto-Create Table
              </Button>
              <p className="text-sm text-red-600">
                If auto-create fails, copy the SQL from 'create-pad-requests-table.sql' and run it manually in Supabase SQL Editor.
              </p>
            </div>
          </div>
        )}

        {tables.every(t => t.exists) && (
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <h3 className="font-semibold text-green-800">✅ All tables exist!</h3>
            <p className="text-green-700">Your database is properly configured.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DatabaseCheck;
