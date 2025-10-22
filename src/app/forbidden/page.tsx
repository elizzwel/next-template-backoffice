'use client';

import { ShieldAlert, Home, ArrowLeft, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ForbiddenPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const route = searchParams.get('route');
  const permission = searchParams.get('permission');
  const error = searchParams.get('error');

  const isRouteNotFound = error === 'route-not-found';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {/* Icon */}
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 animate-pulse ${
            isRouteNotFound ? 'bg-gray-100' : 'bg-red-100'
          }`}>
            {isRouteNotFound ? (
              <AlertCircle className="text-gray-600" size={48} />
            ) : (
              <ShieldAlert className="text-red-600" size={48} />
            )}
          </div>

          {/* Title */}
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            {isRouteNotFound ? '404' : '403'}
          </h1>
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            {isRouteNotFound ? 'Page Not Found' : 'Access Denied'}
          </h2>
          
          {/* Description */}
          <div className="mb-8">
            {isRouteNotFound ? (
              <p className="text-gray-600 text-lg mb-4">
                The page you&apos;re looking for doesn&apos;t exist or has been removed.
              </p>
            ) : (
              <p className="text-gray-600 text-lg mb-4">
                You don&apos;t have permission to access this resource.
              </p>
            )}
            
            {route && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800 font-medium mb-1">
                  Attempted Route:
                </p>
                <code className="text-red-900 font-mono text-sm">
                  {route}
                </code>
              </div>
            )}
            
            {permission && !isRouteNotFound && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-orange-800 font-medium mb-1">
                  Required Permission:
                </p>
                <code className="text-orange-900 font-mono text-sm bg-orange-100 px-2 py-1 rounded">
                  {permission}
                </code>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex items-center gap-2 justify-center"
            >
              <ArrowLeft size={20} />
              Go Back
            </Button>
            <Button
              onClick={() => router.push('/dashboard')}
              variant="primary"
              className="flex items-center gap-2 justify-center"
            >
              <Home size={20} />
              Go to Dashboard
            </Button>
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              {isRouteNotFound 
                ? 'If you believe this page should exist, please contact your administrator.'
                : 'If you believe you should have access to this page, please contact your administrator.'
              }
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Error Code: {isRouteNotFound ? '404' : '403'} | {isRouteNotFound ? 'Not Found' : 'Forbidden Access'}
          </p>
        </div>
      </div>
    </div>
  );
}



