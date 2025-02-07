from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from .models import raktar, reszleg, items
from .serializer import RaktárSerializer, ItemsSerializer, RészlegSerializer


class ReszlegView(generics.ListAPIView):
    queryset = reszleg.objects.all()
    serializer_class = RészlegSerializer

class RaktarView(APIView):
    serializer_class = RaktárSerializer
    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
           serializer.save()
           return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# @api_view(['GET','POST','DELETE'])
# def Részleg_list(request):
#     if request.method == 'GET':
#         részleg = reszleg.objects.all()
#         serializer = RészlegSerializer(részleg, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)
# 
#     if request.method == 'POST':
#         serializer = RészlegSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#     
#     if request.method == 'DELETE':
#         részleg = reszleg.objects.all()
#         részleg.delete()
#         return Response({"message": "Company deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

# @api_view(['GET','POST','DELETE'])
# def Raktár_list(request):
#     raktár = raktar.objects.all()
#     if request.method == 'GET':
#         serializer = RaktárSerializer(raktár, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)
# 
#     if request.method == 'POST':
#         serializer = RaktárSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#     
#     if request.method == 'DELETE':
#         raktár.delete()
#         return Response({"message": "Company deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
# 
# 
# 
# @api_view(['GET', 'PATCH', 'DELETE'])
# def Részleg_details(request, id):
#     try:
#         részleg = reszleg.objects.get(id=id)
#     except reszleg.DoesNotExist:
#         return Response({"error": "Company not found"}, status=status.HTTP_404_NOT_FOUND)
# 
#     if request.method == 'GET':
#         serializer = RészlegSerializer(részleg, many=True)
#         data = serializer.data
#         raktarak = raktar.objects.filter(részleg=részleg)
#         data['raktarak'] = [
#             {
#                 "id": rak.id,
#                 "name": rak.name
#             }
#             for rak in raktarak
#         ]
#         return Response(data, status=status.HTTP_200_OK)
# 
#     if request.method == 'PATCH':
#         serializer = RészlegSerializer(reszleg, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# 
#     if request.method == 'DELETE':
#         reszleg.delete()
#         return Response({"message": "Company deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
# 
# 
# @api_view(['GET', 'POST'])
# def employee_list(request):
#     if request.method == 'GET':
#         employees = Employee.objects.all()
#         serializer = EmployeeSerializer(employees, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)
# 
#     if request.method == 'POST':
#         serializer = EmployeeSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# 
# 
# 
# @api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
# def employee_details(request, id):
#     try:
#         employee = Employee.objects.get(id=id)
#     except Employee.DoesNotExist:
#         return Response({"error": "Employee not found"}, status=status.HTTP_404_NOT_FOUND)
# 
#     if request.method == 'GET':
#         serializer = EmployeeSerializer(employee)
#         data = serializer.data
#         companies = Company.objects.filter(employees=employee)
#         data['company'] = [
#             {
#                 "name": comp.name,
#                 "id": comp.id
#             }
#             for comp in companies
#         ]
#         return Response(data, status=status.HTTP_200_OK)
# 
#     if request.method == 'PUT':
#         serializer = EmployeeSerializer(employee, data=request.data, partial=False)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# 
#     if request.method == 'PATCH':
#         serializer = EmployeeSerializer(employee, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# 
#     if request.method == 'DELETE':
#         employee.delete()
#         return Response({"message": "Company deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
# 
# 
# @api_view(['POST', 'PUT', 'PATCH', 'DELETE'])
# def Bulk_operations(request):
# 
#     if request.method == 'POST':
#         serializer = EmployeeSerializer(data=request.data, many=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# 
#     if request.method == 'PUT':
#         for item in request.data:
#             try:
#                 employee = Employee.objects.get(id=item['id'])
#                 serializer = EmployeeSerializer(employee, data=item)
#                 if serializer.is_valid():
#                     serializer.save()
#                 else:
#                     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#             except Employee.DoesNotExist:
#                 return Response({'error': f"Employee with id {item['id']} not found"}, status=status.HTTP_404_NOT_FOUND)
#         return Response({"message": "Employees updated successfully"}, status=status.HTTP_200_OK)
# 
#     if request.method == 'PATCH':
#         print(request.data)
#         for item in request.data:
#             print(item)
#             try:
#                 employee = Employee.objects.get(id=item['id'])
#                 print(employee)
#                 serializer = EmployeeSerializer(employee, data=item, partial=True)
#                 print(serializer)
#                 if serializer.is_valid():
#                     serializer.save()
#                 else:
#                     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#             except Employee.DoesNotExist:
#                 return Response({'error': f"Employee with id {item['id']} not found"}, status=status.HTTP_404_NOT_FOUND)
#         return Response({"message": "Employees partially updated successfully"}, status=status.HTTP_200_OK)
# 
# 
#     if request.method == 'DELETE':
#         ids = [item['id'] for item in request.data]
#         deleted_count, _ = Employee.objects.filter(id__in=ids).delete()
#         return Response({"message": f"{deleted_count} employees deleted successfully"}, status=status.HTTP_200_OK)