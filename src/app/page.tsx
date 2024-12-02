"use client";
import { useState, useEffect, useRef } from "react";

interface IAsset {
  id: number;
  odometer: number;
  engineHours: number;
  name: string;
  vinCode: string;
  driverId: number;
  driverName: string;
  licensePlate: string;
  fuelLevel: number;
  serialNo: null | number;
  serviceList: any[];
}

interface IResponse {
  items: IAsset[];
  totalCount: number;
}

const fetchAssets = async (): Promise<IResponse> => {
  const response = await fetch(`http://94.182.180.207:5300/Asset/GetAll`);
  const result = await response.json();
  return result.data;
};

export default function Home() {
  const [allAssets, setAllAssets] = useState<IAsset[]>([]);
  const [visibleAssets, setVisibleAssets] = useState<IAsset[]>([]);
  const [itemsToShow, setItemsToShow] = useState(10);
  const totalCount = useRef(0);
  const lastAssetRef = useRef<HTMLDivElement | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<IAsset | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      const data = await fetchAssets();
      setAllAssets(data.items);
      setVisibleAssets(data.items.slice(0, 10));
      totalCount.current = data.totalCount;
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleAssets.length < totalCount.current) {
          setItemsToShow((prev) => prev + 10);
        }
      },
      { rootMargin: "200px" }
    );

    if (lastAssetRef.current) observer.observe(lastAssetRef.current);

    return () => {
      if (lastAssetRef.current) observer.disconnect();
    };
  }, [visibleAssets]);

  useEffect(() => {
    setVisibleAssets(allAssets.slice(0, itemsToShow));
  }, [itemsToShow, allAssets]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 text-black">
      <h1 className="text-2xl font-bold mb-6 text-center">Assets List</h1>
      <table className="w-full border-collapse border border-gray-300 bg-white rounded-lg">
        <thead>
          <tr className="bg-gray-200">
            {[
              "ID",
              "Name",
              "Serial No",
              "Driver Name",
              "VIN Code",
              "Engine Hours",
            ].map((header) => (
              <th
                key={header}
                className="py-2 px-4 border border-gray-300 text-left text-sm"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleAssets.map((asset, index) => (
            <tr
              key={asset.id}
              ref={
                index === visibleAssets.length - 1
                  ? (lastAssetRef as React.RefObject<HTMLTableRowElement>)
                  : null
              }
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => setSelectedAsset(asset)}
            >
              <td className="py-2 px-4 border border-gray-300">{asset.id}</td>
              <td className="py-2 px-4 border border-gray-300">{asset.name}</td>
              <td className="py-2 px-4 border border-gray-300">
                {asset.serialNo || "-"}
              </td>
              <td className="py-2 px-4 border border-gray-300">
                {asset.driverName}
              </td>
              <td className="py-2 px-4 border border-gray-300">
                {asset.vinCode}
              </td>
              <td className="py-2 px-4 border border-gray-300">
                {asset.engineHours}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {selectedAsset && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={() => setSelectedAsset(null)}
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Asset Details</h2>
            <ul className="space-y-2">
              {Object.entries(selectedAsset).map(([key, value]) => (
                <li key={key}>
                  <span className="font-semibold capitalize">{key}:</span>{" "}
                  {value?.toString() || "-"}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setSelectedAsset(null)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}