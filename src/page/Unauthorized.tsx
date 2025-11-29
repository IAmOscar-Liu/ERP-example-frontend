function UnauthorizedPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div>
        <h1 className="mb-3 text-center text-2xl">Unauthorized</h1>
        <p>You are not allowed to visit this page</p>
      </div>
    </div>
  );
}

export default UnauthorizedPage;
