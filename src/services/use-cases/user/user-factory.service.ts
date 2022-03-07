import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/core/dtos/user.dto';
import { User } from 'src/core/entities/user.entity';

@Injectable()
export class UserFactoryService {
  createNewUser(data: CreateUserDto) {
    const user = new User();

    if (data.firstName) user.firstName = data.firstName;
    if (data.lastName) user.lastName = data.lastName;
    if (data.email) user.email = data.email;
    if (data.device) user.device = data.device;
    if (data.password) user.password = data.password;
    if (data.agreedToTerms) user.agreedToTerms = data.agreedToTerms;
    if (data.country) user.country = data.country;
    if (data.isAdmin) user.isAdmin = data.isAdmin;
    if (data.emailVerified) user.emailVerified = data.emailVerified;
    if (data.phoneVerified) user.phoneVerified = data.phoneVerified;
    if (data.verified) user.verified = data.verified;
    if (data.lastLoginDate) user.lastLoginDate = data.lastLoginDate;
    if (data.createdAt) user.createdAt = data.createdAt;
    if (data.phone) user.phone = data.phone;
    if (data.updatedAt) user.updatedAt = data.updatedAt;
    if (data.lock) user.lock = data.lock;
    if (data.authStatus) user.authStatus = data.authStatus;
    if (data.dob) user.dob = data.dob;
    if (data.userType) user.userType = data.userType;
    return user;
  }

  // updateBook(updateBookDto: UpdateUserDto) {
  //   const newBook = new User();
  //   newBook.title = updateBookDto.title;
  //   newBook.author = updateBookDto.authorId;
  //   newBook.genre = updateBookDto.genreId;
  //   newBook.publishDate = updateBookDto.publishDate;

  //   return newBook;
  // }
}
